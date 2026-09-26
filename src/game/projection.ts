/**
 * Biology Dash: Immune Patrol
 * 2.5D Orthographic Perspective Coordinate Mapping
 */

export const VIRTUAL_WIDTH = 420;
export const VIRTUAL_HEIGHT = 780;
export const HORIZON_CENTER_X = 210;

/**
 * Calculates perspective scale factor based on Y depth in the corridor.
 * Far horizon (Y = 0) scales to 0.56; frontline (Y = 780) scales to 1.00.
 */
export function getPerspectiveScale(y: number): number {
  const normY = Math.max(0, Math.min(1, y / VIRTUAL_HEIGHT));
  return 0.56 + 0.44 * normY;
}

/**
 * Projects a 2D corridor coordinate (x, y) into 2.5D screen coordinates
 */
export function projectCorridorToScreen(
  x: number,
  y: number
): { x: number; y: number; scale: number } {
  const scale = getPerspectiveScale(y);
  const screenX = HORIZON_CENTER_X + (x - HORIZON_CENTER_X) * scale;
  const screenY = y;
  return { x: screenX, y: screenY, scale };
}

/**
 * Inverses screen X coordinate back to corridor X coordinate at a given Y depth
 */
export function unprojectScreenX(screenX: number, y: number): number {
  const scale = getPerspectiveScale(y);
  if (scale <= 0.001) return screenX;
  return HORIZON_CENTER_X + (screenX - HORIZON_CENTER_X) / scale;
}
