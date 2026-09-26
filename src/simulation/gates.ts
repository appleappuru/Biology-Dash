/**
 * Biology Dash: Immune Patrol
 * Multiplier Gates, Oscillating Dynamics & Biofilm Obstacles
 */

import { GateItem, BiofilmObstacle, CellUnit } from '../core/types';

export function updateGatesAndBiofilms(
  gates: GateItem[],
  biofilms: BiofilmObstacle[],
  scrollSpeed: number,
  timeSeconds: number,
  dt: number
): void {
  // Move gates down corridor
  for (const gate of gates) {
    gate.y += scrollSpeed * dt;

    if (gate.isOscillating && gate.oscBaseX !== undefined && gate.oscAmplitude && gate.oscSpeed) {
      gate.x = gate.oscBaseX + Math.sin(timeSeconds * gate.oscSpeed) * gate.oscAmplitude;
    }
  }

  // Move biofilms down corridor
  for (const biofilm of biofilms) {
    biofilm.y += scrollSpeed * dt;
  }
}

export interface GateContactResult {
  gate: GateItem;
  cellsToAdd: number;
  cellsToRemove: number;
  buffType?: string;
}

/**
 * Checks collisions between gates and frontline cells.
 * A gate triggers when squad cells cross its threshold.
 */
export function checkGateCollisions(
  gates: GateItem[],
  cells: CellUnit[],
  squadCenter: { x: number; y: number }
): GateContactResult[] {
  const results: GateContactResult[] = [];
  if (cells.length === 0) return results;

  const squadCount = cells.length;

  for (const gate of gates) {
    if (gate.triggered) continue;

    // Check if squad center or individual cells pass through the gate hitbox
    const gateTop = gate.y - gate.height / 2;
    const gateBottom = gate.y + gate.height / 2;
    const gateLeft = gate.x - gate.width / 2;
    const gateRight = gate.x + gate.width / 2;

    // Fast check: is squad center in Y range?
    const inYRange = squadCenter.y >= gateTop - 20 && squadCenter.y <= gateBottom + 20;
    if (!inYRange) continue;

    // Count how many cells are inside gate X boundaries
    let cellsInGate = 0;
    for (const c of cells) {
      if (c.x >= gateLeft && c.x <= gateRight && Math.abs(c.y - gate.y) < 25) {
        cellsInGate++;
      }
    }

    // Trigger if squad center or at least 15% of cells intersect
    const hitSquadCenter = squadCenter.x >= gateLeft && squadCenter.x <= gateRight;
    if (hitSquadCenter || cellsInGate >= Math.max(1, Math.floor(squadCount * 0.15))) {
      gate.triggered = true;

      let cellsToAdd = 0;
      let cellsToRemove = 0;
      let buffType: string | undefined;

      switch (gate.op) {
        case 'multiply': {
          const targetTotal = Math.floor(squadCount * gate.value);
          cellsToAdd = Math.max(0, Math.min(150 - squadCount, targetTotal - squadCount));
          break;
        }
        case 'add': {
          cellsToAdd = Math.min(150 - squadCount, Math.floor(gate.value));
          break;
        }
        case 'divide': {
          const targetTotal = Math.max(1, Math.floor(squadCount / gate.value));
          cellsToRemove = Math.max(0, squadCount - targetTotal);
          break;
        }
        case 'subtract': {
          const targetTotal = Math.max(1, squadCount - Math.floor(gate.value));
          cellsToRemove = Math.max(0, squadCount - targetTotal);
          break;
        }
        case 'turret':
        case 'shield':
        case 'antibody':
          buffType = gate.op;
          break;
      }

      results.push({ gate, cellsToAdd, cellsToRemove, buffType });
    }
  }

  return results;
}

export interface BiofilmImpactResult {
  biofilm: BiofilmObstacle;
  shattered: boolean;
  damageDone: number;
}

/**
 * Checks cell impacts against breakable bacterial biofilms
 */
export function checkBiofilmImpacts(
  biofilms: BiofilmObstacle[],
  cells: CellUnit[]
): BiofilmImpactResult[] {
  const results: BiofilmImpactResult[] = [];

  for (const b of biofilms) {
    if (b.cracked || b.hp <= 0) continue;

    const bLeft = b.x - b.width / 2;
    const bRight = b.x + b.width / 2;
    const bTop = b.y - b.height / 2;
    const bBottom = b.y + b.height / 2;

    let hits = 0;
    for (const cell of cells) {
      if (cell.x >= bLeft && cell.x <= bRight && cell.y >= bTop - 10 && cell.y <= bBottom + 10) {
        hits++;
      }
    }

    if (hits > 0) {
      const damage = Math.min(b.hp, hits * 2);
      b.hp -= damage;
      const shattered = b.hp <= 0;
      if (shattered) {
        b.cracked = true;
      }
      results.push({ biofilm: b, shattered, damageDone: damage });
    }
  }

  return results;
}
