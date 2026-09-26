import { describe, it, expect } from 'vitest';
import {
  computeCrowdOffsets,
  spawnCellUnit,
  updateSwarmPhysics,
} from '../src/simulation/swarm';
import {
  checkGateCollisions,
  checkBiofilmImpacts,
} from '../src/simulation/gates';
import {
  createSimulation,
  tickSimulation,
  fireMedicineWave,
  triggerCytokineSurge,
} from '../src/simulation/simulation';
import { PatrolConfig, GateItem, BiofilmObstacle } from '../src/core/types';

describe('Swarm Dynamics & Crowd Packing', () => {
  it('computes correct golden-angle crowd offsets for small and large crowds', () => {
    const offsets10 = computeCrowdOffsets(10);
    expect(offsets10.length).toBe(10);

    const offsets50 = computeCrowdOffsets(50);
    expect(offsets50.length).toBe(50);
    // Front-to-back sorting guarantees highest Y are at top
    expect(offsets50[0].y).toBeGreaterThanOrEqual(offsets50[offsets50.length - 1].y);
  });

  it('updates cell positions smoothly using spring physics without NaN', () => {
    const cells = [
      spawnCellUnit('neutrophil', 210, 640),
      spawnCellUnit('neutrophil', 210, 640),
    ];
    updateSwarmPhysics(cells, { x: 230, y: 640 }, 0.016);
    expect(cells[0].x).not.toBeNaN();
    expect(cells[0].y).not.toBeNaN();
    expect(cells[0].banking).toBeGreaterThanOrEqual(-0.6);
    expect(cells[0].banking).toBeLessThanOrEqual(0.6);
  });
});

describe('Gate Multipliers & Biofilm Mechanics', () => {
  it('correctly handles arithmetic multiplication gates', () => {
    const cells = Array.from({ length: 10 }, () =>
      spawnCellUnit('neutrophil', 210, 640)
    );
    const gate: GateItem = {
      id: 'g1',
      x: 210,
      y: 640,
      width: 120,
      height: 40,
      op: 'multiply',
      value: 2,
      label: '×2',
      sublabel: 'Chemokines',
    };

    const hits = checkGateCollisions([gate], cells, { x: 210, y: 640 });
    expect(hits.length).toBe(1);
    expect(hits[0].cellsToAdd).toBe(10); // 10 * 2 = 20, so 10 to add
  });

  it('correctly handles addition gates', () => {
    const cells = Array.from({ length: 8 }, () =>
      spawnCellUnit('neutrophil', 210, 640)
    );
    const gate: GateItem = {
      id: 'g2',
      x: 210,
      y: 640,
      width: 120,
      height: 40,
      op: 'add',
      value: 15,
      label: '+15',
      sublabel: 'Recruits',
    };

    const hits = checkGateCollisions([gate], cells, { x: 210, y: 640 });
    expect(hits.length).toBe(1);
    expect(hits[0].cellsToAdd).toBe(15);
  });

  it('damages and cracks biofilms upon cell impacts', () => {
    const cells = [
      spawnCellUnit('neutrophil', 200, 500),
      spawnCellUnit('neutrophil', 205, 500),
    ];
    const biofilm: BiofilmObstacle = {
      id: 'b1',
      x: 200,
      y: 500,
      width: 80,
      height: 40,
      hp: 4,
      maxHp: 4,
      rewardType: 'coins',
      rewardValue: 20,
    };

    const results = checkBiofilmImpacts([biofilm], cells);
    expect(results.length).toBe(1);
    expect(results[0].shattered).toBe(true);
    expect(biofilm.cracked).toBe(true);
  });
});

describe('Simulation Engine, Medicine & Surge', () => {
  const dummyPatrol: PatrolConfig = {
    id: 1,
    name: 'Tutorial',
    subtitle: 'First Hug',
    duration: 32,
    startCells: 6,
    targetSpecies: ['s_aureus'],
    waves: [],
    gateSpawns: [],
    biofilms: [],
    bossHp: 50,
    bossName: 'Staph Cluster',
    bossSpecies: 's_aureus',
    briefing: {
      title: 'First Hug',
      clinicalContext: 'Superficial skin graze',
      targetOrganism: 'Staphylococcus aureus',
      recommendedDrug: 'amoxicillin',
      tip: 'Hold medicine button to clear waves',
    },
  };

  it('initializes state with specified start cells and center', () => {
    const state = createSimulation(dummyPatrol);
    expect(state.cells.length).toBe(6);
    expect(state.status).toBe('playing');
    expect(state.squadCenter.x).toBe(210);
  });

  it('runs deterministic simulation tick without crashing', () => {
    const state = createSimulation(dummyPatrol);
    tickSimulation(state, dummyPatrol, 5, 0.016);
    expect(state.tick).toBe(1);
    expect(state.squadCenter.x).toBe(215);
  });

  it('fires Amoxicillin wave and targets susceptible bacteria', () => {
    const state = createSimulation(dummyPatrol);
    state.microbes.push({
      id: 1,
      species: 's_aureus',
      x: 210,
      y: 400,
      hp: 1,
      maxHp: 1,
      speed: 100,
      width: 32,
      height: 32,
      opsonized: false,
      frozenTimer: 0,
      dizzyTimer: 0,
    });
    state.microbes.push({
      id: 2,
      species: 'mrsa',
      x: 250,
      y: 400,
      hp: 3,
      maxHp: 3,
      speed: 100,
      width: 32,
      height: 32,
      opsonized: false,
      frozenTimer: 0,
      dizzyTimer: 0,
    });

    const result = fireMedicineWave(state, 'amoxicillin');
    expect(result.affectedCount).toBe(1); // s_aureus destroyed
    expect(result.resistantCount).toBe(1); // mrsa resists amoxicillin
    expect(state.microbes.length).toBe(1);
    expect(state.microbes[0].species).toBe('mrsa');
  });

  it('triggers Cytokine Surge and spawns Titan Macrophage', () => {
    const state = createSimulation(dummyPatrol);
    state.cytokineMeter = 100;
    state.isSurgeReady = true;

    const triggered = triggerCytokineSurge(state);
    expect(triggered).toBe(true);
    expect(state.champions.length).toBe(1);
    expect(state.champions[0].type).toBe('titan');
    expect(state.cytokineMeter).toBe(0);
    expect(state.isSurgeReady).toBe(false);
  });
});
