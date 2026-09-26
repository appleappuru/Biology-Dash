/**
 * Biology Dash: Immune Patrol
 * Champion Cytokine Surge State Machine (Titan Macrophage & Plasma Fairy Queen)
 */

import { ChampionUnit, MicrobeUnit, SimulationEvent } from '../core/types';

let nextChampId = 1;

export function spawnChampion(
  type: 'titan' | 'plasma_queen',
  spawnX: number,
  spawnY: number
): ChampionUnit {
  const isTitan = type === 'titan';
  return {
    id: nextChampId++,
    type,
    x: spawnX,
    y: spawnY,
    vy: isTitan ? -320 : -100,
    width: isTitan ? 120 : 80,
    height: isTitan ? 110 : 70,
    active: true,
    lifeTimer: isTitan ? 6.5 : 8.0,
    absorbedCount: 0,
  };
}

export function updateChampions(
  champions: ChampionUnit[],
  microbes: MicrobeUnit[],
  dt: number,
  events: SimulationEvent[]
): void {
  for (let i = champions.length - 1; i >= 0; i--) {
    const champ = champions[i];
    if (!champ.active) continue;

    champ.lifeTimer -= dt;
    champ.y += champ.vy * dt;

    if (champ.type === 'titan') {
      // Titan bulldoze sweep in wide radius
      const left = champ.x - champ.width / 2;
      const right = champ.x + champ.width / 2;
      const top = champ.y - champ.height / 2;
      const bottom = champ.y + champ.height / 2;

      for (let mIdx = microbes.length - 1; mIdx >= 0; mIdx--) {
        const m = microbes[mIdx];
        if (m.x >= left && m.x <= right && m.y >= top && m.y <= bottom) {
          // Titan absorbs microbe instantly!
          microbes.splice(mIdx, 1);
          champ.absorbedCount++;
          events.push({
            type: 'microbe_engulfed',
            data: { microbe: m, byChampion: true },
          });
        }
      }
    } else if (champ.type === 'plasma_queen') {
      // Plasma Queen opsonizes all microbes on screen
      for (const m of microbes) {
        if (!m.opsonized) {
          m.opsonized = true;
          events.push({
            type: 'combo_tick',
            data: { reason: 'opsonized', targetId: m.id },
          });
        }
      }
    }

    // Check expiration
    if (champ.lifeTimer <= 0 || champ.y < -150) {
      champ.active = false;
      champions.splice(i, 1);
    }
  }
}
