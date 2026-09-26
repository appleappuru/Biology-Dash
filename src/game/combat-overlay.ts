/**
 * Biology Dash: Immune Patrol
 * 3/4 Perspective Hold-to-Charge Targeting & Elliptical Shockwave FX
 */

import Phaser from 'phaser';
import { SimulationState, MedicineType } from '../core/types';
import { projectCorridorToScreen } from './projection';

export class CombatOverlay {
  private graphics: Phaser.GameObjects.Graphics;
  private pulseRadius: number = 0;
  private isPulsing: boolean = false;
  private pulseOriginY: number = 700;
  private pulseColor: number = 0x55efc4;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(22);
  }

  public render(
    simState: SimulationState,
    isCharging: boolean,
    chargeProgress: number,
    equippedMed: MedicineType,
    dt: number
  ): void {
    this.graphics.clear();

    // 1. Render Bullet-Time 3/4 Targeting Brackets while charging
    if (isCharging) {
      // Vignette / Bullet-time dark glass tint
      this.graphics.fillStyle(0x02070c, 0.42);
      this.graphics.fillRect(0, 0, 420, 780);

      // 3/4 Perspective Elliptical Charge Ring
      const centerX = 210;
      const centerY = 410;
      this.graphics.lineStyle(4, 0x55efc4, 0.35);
      this.graphics.strokeEllipse(centerX, centerY, 110, 50);

      const angleEnd = -Math.PI / 2 + Math.PI * 2 * Math.min(1, chargeProgress);
      this.graphics.lineStyle(6, 0x55efc4, 0.95);
      this.graphics.beginPath();
      this.graphics.arc(centerX, centerY, 52, -Math.PI / 2, angleEnd, false);
      this.graphics.strokePath();

      // Scan and bracket microbes with 3/4 perspective aspect ratio
      for (const m of simState.microbes) {
        const proj = projectCorridorToScreen(m.x, m.y);
        const isSusceptible = this.checkSusceptibility(m.species, equippedMed);

        if (isSusceptible) {
          // Glowing cyan 3/4 perspective target brackets [ ]
          this.graphics.lineStyle(3, 0x55efc4, 0.95);
          const sx = 22 * proj.scale;
          const sy = 16 * proj.scale; // 3/4 foreshortening

          // Top-left
          this.graphics.beginPath();
          this.graphics.moveTo(proj.x - sx, proj.y - sy + 6);
          this.graphics.lineTo(proj.x - sx, proj.y - sy);
          this.graphics.lineTo(proj.x - sx + 7, proj.y - sy);
          // Top-right
          this.graphics.moveTo(proj.x + sx - 7, proj.y - sy);
          this.graphics.lineTo(proj.x + sx, proj.y - sy);
          this.graphics.lineTo(proj.x + sx, proj.y - sy + 6);
          // Bottom-left
          this.graphics.moveTo(proj.x - sx, proj.y + sy - 6);
          this.graphics.lineTo(proj.x - sx, proj.y + sy);
          this.graphics.lineTo(proj.x - sx + 7, proj.y + sy);
          // Bottom-right
          this.graphics.moveTo(proj.x + sx - 7, proj.y + sy);
          this.graphics.lineTo(proj.x + sx, proj.y + sy);
          this.graphics.lineTo(proj.x + sx, proj.y + sy - 6);
          this.graphics.strokePath();
        } else {
          // 3D Slashed Shield Resistance Indicator
          this.graphics.lineStyle(2.5, 0xff7675, 0.9);
          const rx = 14 * proj.scale;
          const ry = 11 * proj.scale;
          this.graphics.strokeEllipse(proj.x, proj.y, rx * 2, ry * 2);
          this.graphics.lineBetween(proj.x - rx * 0.7, proj.y - ry * 0.7, proj.x + rx * 0.7, proj.y + ry * 0.7);
        }
      }
    }

    // 2. Render expanding 3/4 perspective elliptical shockwave pulse on release
    if (this.isPulsing) {
      this.pulseRadius += 950 * dt;
      const alpha = Math.max(0, 1 - this.pulseRadius / 720);

      // Outer wave (flattened ellipse along Y at 3/4 perspective)
      this.graphics.lineStyle(10, this.pulseColor, alpha);
      this.graphics.strokeEllipse(210, this.pulseOriginY, this.pulseRadius * 2, this.pulseRadius * 0.88);

      // Inner white crest
      this.graphics.lineStyle(4, 0xffffff, alpha * 0.9);
      this.graphics.strokeEllipse(210, this.pulseOriginY, this.pulseRadius * 1.9, this.pulseRadius * 0.84);

      if (this.pulseRadius >= 720) {
        this.isPulsing = false;
        this.pulseRadius = 0;
      }
    }
  }

  public triggerPulse(color: number = 0x55efc4, originY: number = 700): void {
    this.isPulsing = true;
    this.pulseRadius = 15;
    this.pulseColor = color;
    this.pulseOriginY = originY;
  }

  private checkSusceptibility(species: string, med: MedicineType): boolean {
    switch (med) {
      case 'amoxicillin':
        return species === 's_aureus' || species === 'pneumococcus' || species === 'e_coli';
      case 'doxycycline':
        return species !== 'doxy_resistant_sa' && species !== 'mrsa' && species !== 'candida';
      case 'cefepime':
        return species === 'pseudomonas' || species === 'e_coli' || species === 's_aureus';
      case 'micafungin':
        return species === 'candida';
      default:
        return false;
    }
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
