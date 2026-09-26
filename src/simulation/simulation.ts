/**
 * Biology Dash: Immune Patrol
 * Pure Deterministic 60Hz Simulation Loop & Combat Engine
 */

import type {
  SimulationState,
  PatrolConfig,
  CellUnit,
  MedicineType,
} from '../core/types';
import {
  updateSwarmPhysics,
  spawnCellUnit,
  FRONTLINE_BASE_Y,
  CORRIDOR_CENTER_X,
  resetCellIdCounter,
} from './swarm';
import {
  updateGatesAndBiofilms,
  checkGateCollisions,
  checkBiofilmImpacts,
} from './gates';
import { spawnChampion, updateChampions } from './champions';

export const SCROLL_SPEED = 180; // px/s
export const BREACH_LINE_Y = 710;
export const MAX_SQUAD_CAP = 150;

let nextMicrobeId = 1;

export function createSimulation(config: PatrolConfig): SimulationState {
  resetCellIdCounter();
  nextMicrobeId = 1;

  const cells: CellUnit[] = [];
  const startCount = config.startCells || 6;
  for (let i = 0; i < startCount; i++) {
    cells.push(spawnCellUnit('neutrophil', CORRIDOR_CENTER_X, FRONTLINE_BASE_Y));
  }

  // Flatten initial gate spawns
  const gates = config.gateSpawns.flatMap((spawn) =>
    spawn.pairs.map((g) => ({ ...g, y: g.y }))
  );

  return {
    tick: 0,
    timeSeconds: 0,
    patrolDuration: config.duration,
    squadCenter: { x: CORRIDOR_CENTER_X, y: FRONTLINE_BASE_Y },
    cells,
    microbes: [],
    gates,
    biofilms: config.biofilms.map((b) => ({ ...b })),
    champions: [],
    frontlineY: FRONTLINE_BASE_Y,
    breachLineY: BREACH_LINE_Y,
    pushbackOffset: 0,
    cytokineMeter: 0,
    cytokineMax: 100,
    isSurgeReady: false,
    bulletTimeActive: false,
    bulletTimeScale: 0.6,
    score: 0,
    coinsEarned: 0,
    comboCount: 0,
    comboTimer: 0,
    status: 'playing',
    colonyBoss: null,
    events: [],
  };
}

export function tickSimulation(
  state: SimulationState,
  config: PatrolConfig,
  inputDeltaX: number,
  rawDt: number = 1 / 60
): void {
  if (state.status !== 'playing') return;

  state.events = [];
  state.tick++;

  const dt = state.bulletTimeActive ? rawDt * state.bulletTimeScale : rawDt;
  state.timeSeconds += dt;

  // 1. Move squad center with relative drag
  state.squadCenter.x = Math.max(50, Math.min(370, state.squadCenter.x + inputDeltaX));

  // 2. Frontline pushback calculation
  const squadCount = state.cells.length;
  const nearbyMicrobes = state.microbes.filter((m) => m.y > 450 && m.y < 700).length;
  const total = squadCount + nearbyMicrobes;
  if (total > 0) {
    const ratio = (squadCount - nearbyMicrobes) / total;
    state.pushbackOffset = Math.max(-80, Math.min(60, ratio * 50));
  } else {
    state.pushbackOffset = 0;
  }
  state.frontlineY = FRONTLINE_BASE_Y - state.pushbackOffset;
  state.squadCenter.y = state.frontlineY;

  // 3. Spawn scripted waves from patrol config
  for (const wave of config.waves) {
    const waveTriggered =
      state.timeSeconds >= wave.timeOffset &&
      state.timeSeconds - dt < wave.timeOffset;
    if (waveTriggered) {
      spawnWaveMicrobes(state, wave);
    }
  }

  // 4. Update Microbes motion & timers
  for (let i = state.microbes.length - 1; i >= 0; i--) {
    const m = state.microbes[i];
    if (m.frozenTimer > 0) {
      m.frozenTimer -= dt;
    } else {
      m.y += m.speed * dt;
    }

    if (m.dizzyTimer > 0) {
      m.dizzyTimer -= dt;
    }

    // Check tissue breach line
    if (m.y >= state.breachLineY && !m.isBoss) {
      state.microbes.splice(i, 1);
      state.score = Math.max(0, state.score - 50);
      // If squad is wiped out, breach causes defeat
      if (state.cells.length === 0) {
        state.status = 'defeat';
        return;
      }
    }
  }

  // 5. Update Gates, Biofilms, and Champions
  updateGatesAndBiofilms(state.gates, state.biofilms, SCROLL_SPEED, state.timeSeconds, dt);
  updateChampions(state.champions, state.microbes, dt, state.events);

  // 6. Check Gate collisions
  const gateHits = checkGateCollisions(state.gates, state.cells, state.squadCenter);
  for (const hit of gateHits) {
    state.events.push({ type: 'gate_hit', data: hit });

    if (hit.cellsToAdd > 0) {
      const toAdd = Math.min(MAX_SQUAD_CAP - state.cells.length, hit.cellsToAdd);
      for (let k = 0; k < toAdd; k++) {
        state.cells.push(spawnCellUnit('neutrophil', state.squadCenter.x, state.squadCenter.y + 30));
      }
      state.events.push({ type: 'cell_spawned', data: { count: toAdd } });
    }

    if (hit.cellsToRemove > 0) {
      const toRemove = Math.min(state.cells.length - 1, hit.cellsToRemove);
      state.cells.splice(0, toRemove);
      state.events.push({ type: 'cell_lost', data: { count: toRemove } });
    }

    // Pass gate awards cytokine boost
    state.cytokineMeter = Math.min(state.cytokineMax, state.cytokineMeter + 15);
    state.isSurgeReady = state.cytokineMeter >= state.cytokineMax;
  }

  // 7. Check Biofilm impacts
  const biofilmHits = checkBiofilmImpacts(state.biofilms, state.cells);
  for (const bHit of biofilmHits) {
    state.events.push({ type: 'biofilm_hit', data: bHit });
    if (bHit.shattered) {
      state.events.push({ type: 'biofilm_burst', data: bHit.biofilm });
      if (bHit.biofilm.rewardType === 'coins') {
        state.coinsEarned += bHit.biofilm.rewardValue;
      } else if (bHit.biofilm.rewardType === 'macrophage') {
        state.cells.push(spawnCellUnit('macrophage', bHit.biofilm.x, state.squadCenter.y));
      }
    }
  }

  // 8. Clashing frontline combat (Phagocytosis engulfment)
  resolveCombatClash(state, dt);

  // 9. Update swarm physics
  updateSwarmPhysics(state.cells, state.squadCenter, dt);

  // 10. Check Boss & Patrol Duration
  checkBossAndVictory(state, config, dt);

  // Combo timer decay
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.comboCount = 0;
    }
  }
}

function spawnWaveMicrobes(state: SimulationState, wave: any): void {
  const count = wave.count;
  const spacing = wave.spreadX / Math.max(1, count - 1);
  const startX = CORRIDOR_CENTER_X - wave.spreadX / 2;

  for (let i = 0; i < count; i++) {
    const x = count === 1 ? CORRIDOR_CENTER_X : startX + i * spacing;
    state.microbes.push({
      id: nextMicrobeId++,
      species: wave.species,
      x,
      y: wave.baseY || -30,
      hp: wave.species === 'mrsa' ? 3 : 1,
      maxHp: wave.species === 'mrsa' ? 3 : 1,
      speed: wave.species === 'pseudomonas' ? 140 : 100,
      width: 32,
      height: 32,
      opsonized: false,
      frozenTimer: 0,
      dizzyTimer: 0,
    });
  }
}

function resolveCombatClash(state: SimulationState, _dt: number): void {
  for (let cIdx = 0; cIdx < state.cells.length; cIdx++) {
    const cell = state.cells[cIdx];
    if (cell.state === 'digesting') continue;

    const reach = cell.type === 'macrophage' ? 45 : 30;

    for (let mIdx = state.microbes.length - 1; mIdx >= 0; mIdx--) {
      const m = state.microbes[mIdx];
      const dx = cell.x - m.x;
      const dy = cell.y - m.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < reach * reach) {
        // Phagocytosis hit
        m.hp--;
        if (m.hp <= 0) {
          state.microbes.splice(mIdx, 1);
          cell.state = 'digesting';
          cell.digestionTimer = cell.type === 'macrophage' ? 0.4 : 0.6;

          state.score += 100;
          state.comboCount++;
          state.comboTimer = 1.5;
          state.cytokineMeter = Math.min(state.cytokineMax, state.cytokineMeter + 4);
          state.isSurgeReady = state.cytokineMeter >= state.cytokineMax;

          state.events.push({
            type: 'microbe_engulfed',
            data: { microbe: m, combo: state.comboCount },
          });
        }
        break;
      }
    }
  }
}

function checkBossAndVictory(
  state: SimulationState,
  config: PatrolConfig,
  dt: number
): void {
  // Spawn Colony Core when time reaches 80% duration if not already spawned
  if (state.timeSeconds >= state.patrolDuration * 0.8 && !state.colonyBoss) {
    state.colonyBoss = {
      id: 9999,
      species: config.bossSpecies || 's_aureus',
      x: CORRIDOR_CENTER_X,
      y: 120,
      hp: config.bossHp || 100,
      maxHp: config.bossHp || 100,
      speed: 0,
      width: 140,
      height: 120,
      opsonized: false,
      frozenTimer: 0,
      dizzyTimer: 0,
      isBoss: true,
    };
  }

  // Boss Swarm Frenzy!
  if (state.colonyBoss) {
    const boss = state.colonyBoss;
    // When boss is present, squad cells rush forward to chew away HP
    const damage = Math.max(1, Math.floor(state.cells.length * 0.45 * dt * 60));
    boss.hp = Math.max(0, boss.hp - damage);

    state.events.push({
      type: 'colony_hit',
      data: { bossHp: boss.hp, maxHp: boss.maxHp },
    });

    if (boss.hp <= 0) {
      state.status = 'victory';
      state.coinsEarned += 50;
      state.events.push({ type: 'colony_burst', data: { boss } });
    }
  } else if (state.timeSeconds >= state.patrolDuration) {
    state.status = 'victory';
    state.coinsEarned += 30;
  }
}

/**
 * Fires the tactical medicine wave against susceptible microbes
 */
export function fireMedicineWave(
  state: SimulationState,
  medType: MedicineType
): { affectedCount: number; resistantCount: number } {
  let affectedCount = 0;
  let resistantCount = 0;

  for (let i = state.microbes.length - 1; i >= 0; i--) {
    const m = state.microbes[i];
    let isSusceptible = false;

    switch (medType) {
      case 'amoxicillin':
        // Effective against standard S. aureus, Pneumococcus, E. coli
        // Ineffective against beta-lactamase+, MRSA, Pseudomonas, Candida
        isSusceptible =
          m.species === 's_aureus' ||
          m.species === 'pneumococcus' ||
          m.species === 'e_coli';
        break;
      case 'doxycycline':
        // Halts translation for most bacteria except doxy-resistant and MRSA
        isSusceptible =
          m.species !== 'doxy_resistant_sa' &&
          m.species !== 'mrsa' &&
          m.species !== 'candida';
        break;
      case 'cefepime':
        // High-potency cephalosporin for Pseudomonas and E. coli
        isSusceptible =
          m.species === 'pseudomonas' ||
          m.species === 'e_coli' ||
          m.species === 's_aureus';
        break;
      case 'micafungin':
        // Antifungal: only destroys Candida
        isSusceptible = m.species === 'candida';
        break;
    }

    if (isSusceptible) {
      affectedCount++;
      if (medType === 'doxycycline') {
        m.frozenTimer = 6.0;
        m.dizzyTimer = 6.0;
      } else {
        state.microbes.splice(i, 1);
        state.score += 80;
      }
    } else {
      resistantCount++;
      m.dizzyTimer = 0.5; // shows shrug/shield
    }
  }

  state.events.push({
    type: 'medicine_fired',
    data: { medType, affectedCount, resistantCount },
  });

  return { affectedCount, resistantCount };
}

/**
 * Activates the Cytokine Champion surge
 */
export function triggerCytokineSurge(state: SimulationState): boolean {
  if (!state.isSurgeReady) return false;

  const titan = spawnChampion('titan', state.squadCenter.x, state.squadCenter.y - 20);
  state.champions.push(titan);

  state.cytokineMeter = 0;
  state.isSurgeReady = false;
  state.events.push({ type: 'champion_spawned', data: { champion: titan } });

  return true;
}
