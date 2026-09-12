import * as Phaser from 'phaser';
import { Patrol } from './simulation';
import { PATHOGENS } from './content';
export interface GameHooks {
    tick: (p: Patrol) => void;
    event: (text: string) => void;
    finish: (p: Patrol) => void;
    pause: () => void;
    gesture: () => void;
}
export class PatrolScene extends Phaser.Scene {
    patrol!: Patrol;
    hooks!: GameHooks;
    held = false;
    dragX = 0;
    dragStart = 0;
    paused = true;
    finished = false;
    muted = false;
    volume = .25;
    reducedMotion = false;
    views = new Map<number, Phaser.GameObjects.Container>();
    gateViews = new Map<number, Phaser.GameObjects.Container>();
    cells: Phaser.GameObjects.Image[] = [];
    zone!: Phaser.GameObjects.Graphics;
    bg!: Phaser.GameObjects.TileSprite;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    lastSound = 0;
    constructor() { super('Patrol'); }
    preload() { this.load.spritesheet('cells', 'assets/immune-sprite-atlas.png', { frameWidth: 362, frameHeight: 362 }); this.load.image('tissue', 'assets/tissue-corridor.png'); for (const s of ['soft', 'recruit', 'finish'])
        this.load.audio(s, `assets/${s}.wav`); }
    create() {
        this.bg = this.add.tileSprite(210, 390, 420, 780, 'tissue');
        this.bg.tileScaleX = 420 / 1024;
        this.bg.tileScaleY = 780 / 1536;
        this.add.rectangle(210, 390, 344, 780, 0x082f39, .28);
        const g = this.add.graphics();
        g.lineStyle(1, 0x67cfbf, .15);
        for (const x of [94, 210, 326]) {
            for (let y = 70; y < 690; y += 26)
                g.lineBetween(x, y, x, y + 10);
        }
        g.lineStyle(2, 0xedb19d, .6);
        g.lineBetween(36, 713, 384, 713);
        this.add.text(210, 727, 'TISSUE LINE · BREACH COSTS 1 CELL', { fontFamily: 'Arial', fontSize: '11px', color: '#e2b8ad', letterSpacing: 1 }).setOrigin(.5);
        this.zone = this.add.graphics();
        for (let i = 0; i < 12; i++) {
            this.cells.push(this.add.image(210, 645, 'cells', 0).setDisplaySize(43, 43).setDepth(20));
        }
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.hooks?.gesture(); this.held = true; this.dragX = p.x; this.dragStart = this.patrol?.x ?? 210; });
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.held && !this.paused)
            this.patrol?.move(this.dragStart + p.x - this.dragX); });
        this.input.on('pointerup', () => this.cancelDrag());
        this.input.on('pointerupoutside', () => this.cancelDrag());
        this.input.on('gameout', () => this.cancelDrag());
        this.keys = this.input.keyboard!.addKeys('LEFT,RIGHT,A,D,SPACE,ESC') as typeof this.keys;
        this.input.keyboard!.on('keydown-ESC', () => this.hooks?.pause());
        this.input.keyboard!.on('keydown-SPACE', () => { if (!this.paused)
            this.patrol?.useMedicine(); });
        this.game.canvas.addEventListener('pointercancel', this.cancelDrag);
        this.game.events.on(Phaser.Core.Events.BLUR, this.onBlur);
        this.events.once('shutdown', () => { this.game.canvas.removeEventListener('pointercancel', this.cancelDrag); this.game.events.off(Phaser.Core.Events.BLUR, this.onBlur); });
    }
    onBlur = () => { this.cancelDrag(); if (!this.paused)
        this.hooks?.pause(); };
    cancelDrag = () => { this.held = false; this.input.keyboard?.resetKeys(); };
    startPatrol(p: Patrol, hooks: GameHooks) { this.patrol = p; this.hooks = hooks; this.finished = false; this.paused = false; this.cancelDrag(); for (const v of this.views.values())
        v.destroy(); for (const v of this.gateViews.values())
        v.destroy(); this.views.clear(); this.gateViews.clear(); }
    soundCue(key: string) { if (this.muted || this.time.now - this.lastSound < 150)
        return; this.lastSound = this.time.now; this.sound.play(key, { volume: this.volume * .5 }); }
    update(_time: number, delta: number) {
        if (!this.patrol)
            return;
        const p = this.patrol;
        if (!this.paused && !this.finished) {
            const d = Math.min(delta / 1000, .05);
            if (this.keys.LEFT.isDown || this.keys.A.isDown)
                p.move(p.x - d * 280);
            if (this.keys.RIGHT.isDown || this.keys.D.isDown)
                p.move(p.x + d * 280);
            p.step(d);
            if (!this.reducedMotion)
                this.bg.tilePositionY -= d * 19;
            for (const e of p.drainEvents()) {
                if (e.type === 'engulf') {
                    this.soundCue('soft');
                    if (!this.reducedMotion) {
                        const ring = this.add.circle(e.x!, e.y!, 25, 0xa8fff0, .15).setStrokeStyle(2, 0xbcfff2, .8).setDepth(30);
                        this.tweens.add({ targets: ring, scale: 1.7, alpha: 0, duration: 220, onComplete: () => ring.destroy() });
                    }
                }
                else if (e.type === 'tag') { }
                else {
                    this.hooks.event(e.text);
                    if (e.type === 'gate')
                        this.soundCue('recruit');
                    if (e.type === 'loss' && !this.reducedMotion)
                        this.cameras.main.shake(90, .002);
                }
            }
            this.hooks.tick(p);
            if (p.phase !== 'playing') {
                this.finished = true;
                this.soundCue('finish');
                this.hooks.finish(p);
            }
        }
        this.zone.clear();
        this.zone.fillStyle(0x78edd2, .055);
        this.zone.fillRoundedRect(p.x - p.coverage, 503, p.coverage * 2, 171, 20);
        this.zone.lineStyle(1, 0x91ffe0, .25);
        this.zone.strokeRoundedRect(p.x - p.coverage, 503, p.coverage * 2, 171, 20);
        this.cells.forEach((c, i) => { const count = Math.min(12, p.squad); c.setVisible(i < count); c.setFrame(p.plasma && i === count - 1 ? 2 : p.defender === 'macrophage' ? 1 : 0); const row = Math.floor(i / 4); c.setPosition(p.x + (i % 4 - 1.5) * 27 + (row % 2 ? 8 : 0), 632 + row * 22 + (this.reducedMotion ? 0 : Math.sin(_time / 400 + i) * 2)); c.setAlpha(p.protection > 0 ? .55 : 1); });
        for (const e of p.enemies) {
            let v = this.views.get(e.id);
            if (!v) {
                const idx = PATHOGENS.findIndex(k => k.id === e.kind);
                const frame = e.boss ? 9 : [4, 6, 4, 4, 4][idx];
                const sprite = this.add.image(0, 0, 'cells', frame).setDisplaySize(e.boss ? 106 : 62, e.boss ? 106 : 62);
                if (idx === 3)
                    sprite.setTint(0xd4a5ff);
                if (idx === 2)
                    sprite.setTint(0xffb1cb);
                if (idx === 4)
                    sprite.setTint(0x79ffed);
                const label = this.add.text(0, e.boss ? -65 : -40, e.boss ? 'COLONY' : `• ${PATHOGENS[idx].epitope}`, { fontFamily: 'Arial', fontSize: e.boss ? '12px' : '13px', color: '#e1fff6', fontStyle: 'bold' }).setOrigin(.5);
                const bar = this.add.rectangle(-24, e.boss ? 56 : 33, 48, 3, 0x8af0cf).setOrigin(0, .5);
                const tag = this.add.text(26, -16, 'Y', { fontFamily: 'Arial', fontSize: '22px', color: '#dcc5ff', fontStyle: 'bold' });
                v = this.add.container(e.x, e.y, [sprite, label, bar, tag]).setDepth(10);
                this.views.set(e.id, v);
            }
            v.setPosition(e.x, e.y);
            (v.list[2] as Phaser.GameObjects.Rectangle).width = 48 * Math.max(0, e.hp / e.maxHp);
            v.list[3].setActive(e.tagged);
            (v.list[3] as Phaser.GameObjects.Text).setVisible(e.tagged);
            if (e.inhibited)
                (v.list[2] as Phaser.GameObjects.Rectangle).setFillStyle(0xd2b7ff);
        }
        for (const [id, v] of this.views)
            if (!p.enemies.some(e => e.id === id)) {
                v.destroy();
                this.views.delete(id);
            }
        for (const gate of p.gates) {
            let v = this.gateViews.get(gate.id);
            if (!v) {
                const left = this.add.rectangle(-88, 0, 158, 63, 0x377f71, .9).setStrokeStyle(1, 0xa7ffe4, .8);
                const right = this.add.rectangle(88, 0, 158, 63, 0x675983, .92).setStrokeStyle(1, 0xddc8ff, .8);
                const a = this.add.text(-88, -12, '+4 CELLS', { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#dffff4' }).setOrigin(.5);
                const b = this.add.text(88, -12, 'WIDER REACH', { fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold', color: '#f3e9ff' }).setOrigin(.5);
                const a2 = this.add.text(-88, 12, 'recruitment', { fontFamily: 'Arial', fontSize: '12px', color: '#c1ecdc' }).setOrigin(.5);
                const b2 = this.add.text(88, 12, 'no extra cells', { fontFamily: 'Arial', fontSize: '12px', color: '#e0d3ee' }).setOrigin(.5);
                v = this.add.container(210, gate.y, [left, right, a, b, a2, b2]).setDepth(5);
                this.gateViews.set(gate.id, v);
            }
            v.y = gate.y;
            v.setAlpha(gate.used ? .2 : 1);
        }
        for (const [id, v] of this.gateViews)
            if (!p.gates.some(g => g.id === id)) {
                v.destroy();
                this.gateViews.delete(id);
            }
    }
}
export function createGame() { return new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#082d38', width: 420, height: 780, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [PatrolScene], audio: { disableWebAudio: false }, render: { antialias: true }, input: { activePointers: 2 } }); }
