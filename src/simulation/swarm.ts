/**
 * Biology Dash: Immune Patrol
 * Swarm Dynamics, Flocking & Capillary Extravasation Math
 */

import { CellUnit, DefenderType } from '../core/types';

export const CORRIDOR_LEFT = 30;
export const CORRIDOR_RIGHT = 390;
export const CORRIDOR_WIDTH = 420;
export const CORRIDOR_CENTER_X = 210;
export const FRONTLINE_BASE_Y = 640;
export const CAPILLARY_Y = 720;

export const SWARM_PHYSICS = {
  damping: 0.85,
  stiffness: 0.12,
  maxTilt: 0.6,
  minCellSpacing: 18,
};

let nextCellId = 1;

export function resetCellIdCounter(): void {
  nextCellId = 1;
}

/**
 * Calculates optimal relative target offsets for N cells in a crowd formation
 * using Golden-Angle spiral (sunflower phyllotaxis) adapted to corridor oval bounds.
 */
export function computeCrowdOffsets(count: number, corridorWidth: number = 340): { x: number; y: number }[] {
  const offsets: { x: number; y: number }[] = [];
  if (count <= 0) return offsets;

  const goldenAngle = 2.39996323; // radians (~137.5 degrees)
  const spreadFactor = Math.min(corridorWidth * 0.44, 18 + 7.5 * Math.sqrt(count));
  const verticalRatio = 0.65; // oval squish for forward marching perspective

  for (let i = 0; i < count; i++) {
    if (i === 0) {
      offsets.push({ x: 0, y: 0 });
      continue;
    }
    const r = Math.sqrt(i / count) * spreadFactor;
    const theta = i * goldenAngle;
    const ox = Math.cos(theta) * r;
    const oy = Math.sin(theta) * r * verticalRatio;
    offsets.push({ x: ox, y: oy });
  }

  // Sort back-to-front so frontline cells are at top
  return offsets.sort((a, b) => b.y - a.y);
}

/**
 * Creates a new cell unit with initial spawn placement at the capillary feeder
 */
export function spawnCellUnit(
  type: DefenderType,
  spawnX: number,
  spawnY: number = CAPILLARY_Y,
  targetOffset = { x: 0, y: 0 }
): CellUnit {
  return {
    id: nextCellId++,
    type,
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: -60, // initial extravasation push forward
    targetOffset,
    scale: type === 'macrophage' ? 1.4 : type === 'plasma' ? 1.15 : 1.0,
    squashX: 1.0,
    squashY: 1.0,
    banking: 0,
    state: 'marching',
    digestionTimer: 0,
  };
}

/**
 * Updates all cells in the swarm using spring physics toward their flock slot
 */
export function updateSwarmPhysics(
  cells: CellUnit[],
  squadCenter: { x: number; y: number },
  dt: number
): void {
  const count = cells.length;
  if (count === 0) return;

  const offsets = computeCrowdOffsets(count);

  for (let i = 0; i < count; i++) {
    const cell = cells[i];
    const offset = offsets[i] || { x: 0, y: 0 };
    cell.targetOffset = offset;

    const targetX = Math.max(CORRIDOR_LEFT + 15, Math.min(CORRIDOR_RIGHT - 15, squadCenter.x + offset.x));
    const targetY = squadCenter.y + offset.y;

    // Spring forces toward target
    const ax = (targetX - cell.x) * (SWARM_PHYSICS.stiffness / Math.max(0.016, dt));
    const ay = (targetY - cell.y) * (SWARM_PHYSICS.stiffness / Math.max(0.016, dt));

    cell.vx = (cell.vx + ax * dt) * SWARM_PHYSICS.damping;
    cell.vy = (cell.vy + ay * dt) * SWARM_PHYSICS.damping;

    cell.x += cell.vx * dt;
    cell.y += cell.vy * dt;

    // Lateral banking based on horizontal speed
    cell.banking = Math.max(-SWARM_PHYSICS.maxTilt, Math.min(SWARM_PHYSICS.maxTilt, cell.vx / 180));

    // Squash & stretch based on velocity and subtle breathing
    const speed = Math.sqrt(cell.vx * cell.vx + cell.vy * cell.vy);
    const stretch = Math.min(0.25, speed / 500);
    cell.squashX = 1.0 - stretch * 0.6;
    cell.squashY = 1.0 + stretch;

    // Digestion timer countdown
    if (cell.state === 'digesting') {
      cell.digestionTimer -= dt;
      if (cell.digestionTimer <= 0) {
        cell.state = 'marching';
      }
    }
  }
}
