import { describe, it, expect } from 'vitest';
import { Patrol, BALANCE, type Gate } from '../src/simulation';

describe('three-lane gates and vertical stagger', () => {
    it('supports left, center, and right lane options across the corridor', () => {
        const p = new Patrol(2);
        const g: Gate = {
            id: 101,
            y: 500,
            used: false,
            layout: 'triple',
            left: { id: 'recruit', label: '+4 cells', detail: 'Recruit', kind: 'recruit', value: 4 },
            center: { id: 'tempo', label: 'Rapid response', detail: 'Tempo', kind: 'tempo', value: 12 },
            right: { id: 'shield', label: 'Rescue shield', detail: 'Shield', kind: 'shield', value: 8 },
        };
        const opts = p.gateOptions(g);
        expect(opts.left.value).toBe(4);
        expect(opts.center?.kind).toBe('tempo');
        expect(opts.right.kind).toBe('shield');

        // Apply center choice
        expect(p.applyGate(g, 'center')).toBe(true);
        expect(p.tempoRemaining).toBe(12);
        expect(g.used).toBe(true);
    });

    it('collects the center lane when crossing near x=210', () => {
        const p = new Patrol(2);
        p.nextSpawn = 999; p.nextGate = 999;
        const g: Gate = {
            id: 102,
            y: 610,
            used: false,
            layout: 'staggered',
            left: { id: 'recruit', label: '+4 cells', detail: 'Recruit', kind: 'recruit', value: 4 },
            center: { id: 'reach', label: '+18 reach', detail: 'Coverage', kind: 'coverage', value: 18 },
            right: { id: 'shield', label: 'Rescue shield', detail: 'Shield', kind: 'shield', value: 8 },
        };
        p.gates = [g];
        p.move(210, 635);
        p.step(0.05);
        expect(g.used).toBe(true);
        expect(p.coverage).toBe(70); // 52 base + 18
    });

    it('enforces a dilemma where opposite-lane gates with small stagger cannot both be reached', () => {
        // Player at left lane (x=115, y=635)
        const p = new Patrol(2);
        p.nextSpawn = 999; p.nextGate = 999;

        // Gate 1 in left lane (y=610), Gate 2 in right lane (y=590) - only 20px vertical stagger
        const g1: Gate = { id: 201, y: 610, used: false, layout: 'left', left: { id: 'rec', label: '+4', detail: '', kind: 'recruit', value: 4 } };
        const g2: Gate = { id: 202, y: 590, used: false, layout: 'right', right: { id: 'reach', label: '+18', detail: '', kind: 'coverage', value: 18 } };
        p.gates = [g1, g2];

        // Player collects g1 in left lane
        p.move(115, 635);
        p.step(0.05);
        expect(g1.used).toBe(true);
        expect(p.squad).toBe(16);

        // Player now steers full speed toward right lane (x=305)
        // Traversing 190px at 255 px/s takes ~0.745s
        // During this time, g2 descends at 78 px/s
        let reachedG2 = false;
        for (let t = 0; t < 20; t++) {
            const dt = 0.05;
            p.move(Math.min(305, p.x + 255 * dt), 635);
            p.step(dt);
            if (g2.used) reachedG2 = true;
        }

        // g2 descended past the squad line before the squad could reach x=305!
        expect(reachedG2).toBe(false);
        expect(g2.passed).toBe(true);
        expect(g2.used).toBe(false);
    });

    it('allows agile players to collect both gates when vertical spacing provides sufficient travel time', () => {
        const p = new Patrol(2);
        p.nextSpawn = 999; p.nextGate = 999;

        // g1 in left lane at y=610, g2 in right lane at y=480 (staggered by 130px)
        const g1: Gate = { id: 301, y: 610, used: false, layout: 'left', left: { id: 'rec', label: '+4', detail: '', kind: 'recruit', value: 4 } };
        const g2: Gate = { id: 302, y: 480, used: false, layout: 'right', right: { id: 'reach', label: '+18', detail: '', kind: 'coverage', value: 18 } };
        p.gates = [g1, g2];

        // Collect g1 on left
        p.move(115, 635);
        p.step(0.05);
        expect(g1.used).toBe(true);
        expect(p.squad).toBe(16);

        // Steer across to right lane
        for (let t = 0; t < 45; t++) {
            const dt = 0.05;
            p.move(Math.min(305, p.x + 255 * dt), 635);
            p.step(dt);
            if (g2.used) break;
        }

        expect(g2.used).toBe(true);
        expect(p.coverage).toBe(70);
    });
});

describe('gate contact and projectile reactions', () => {
    it('triggers defender reach reaction when squad approaches gate threshold', () => {
        const p = new Patrol(2);
        p.nextSpawn = 999; p.nextGate = 999;
        const g: Gate = {
            id: 401,
            y: 590, // within 38px of squad line (635 - 25 = 610)
            used: false,
            layout: 'pair',
        };
        p.gates = [g];
        p.move(115, 635);
        p.step(0.05);
        expect(g.hitReaction).toBeDefined();
        expect(g.hitReaction?.kind).toBe('defender');
        expect(g.hitReaction?.lane).toBe('left');
    });

    it('triggers projectile reaction when defensin particle intersects gate area', () => {
        const p = new Patrol(2);
        p.nextSpawn = 999; p.nextGate = 999;
        p.spawn('susceptible');
        const target = p.enemies[0];
        target.x = 210; target.y = 200;
        const g: Gate = {
            id: 501,
            y: 350,
            used: false,
            layout: 'staggered',
            center: { id: 'rec', label: '+4', detail: '', kind: 'recruit', value: 4 },
        };
        p.gates = [g];
        // Inject a defensin particle targeting the enemy at center lane intersecting gate y
        p.defensins.push({ id: 99, targetId: target.id, x: 210, y: 352, age: 0.1 });
        p.step(0.05);
        expect(g.hitReaction).toBeDefined();
        expect(g.hitReaction?.kind).toBe('projectile');
        expect(g.hitReaction?.lane).toBe('center');
    });

    it('triggers projectile reaction when antibody particle diffuses through gate area', () => {
        const p = new Patrol(3);
        p.nextSpawn = 999; p.nextGate = 999;
        p.spawn('susceptible');
        const target = p.enemies[0];
        target.x = 300; target.y = 390;
        const g: Gate = {
            id: 601,
            y: 400,
            used: false,
            layout: 'triple',
        };
        p.gates = [g];
        p.antibodies.push({
            id: 88,
            sourceId: 1,
            targetId: target.id,
            x: 300,
            y: 402,
            startX: 300,
            startY: 405,
            age: 0.1,
            duration: 1.0,
            profile: { epitope: 'A', affinity: 0.8, effector: 'opsonization' },
            phase: 'diffuse',
        });
        p.step(0.05);
        expect(g.hitReaction).toBeDefined();
        expect(g.hitReaction?.kind).toBe('projectile');
        expect(g.hitReaction?.lane).toBe('right');
    });
});

describe('first-run onboarding gate preservation', () => {
    it('places first gate at y=250 with +4 cells for immediate learning', () => {
        const p = new Patrol(1);
        p.time = 4;
        p.step(0.05);
        expect(p.gates.length).toBeGreaterThan(0);
        const firstGate = p.gates[0];
        expect(firstGate.y).toBeCloseTo(253.9, 1);
        expect(firstGate.left?.value).toBe(4);
        expect(firstGate.left?.kind).toBe('recruit');

        // Steer left and step until the gate reaches the squad line
        for (let i = 0; i < 60; i++) {
            p.move(110, 460);
            p.step(0.05);
            if (p.learning.gate) break;
        }
        expect(p.learning.gate).toBe(true);
        expect(p.squad).toBe(5); // 1 base + 4 recruited
    });
});
