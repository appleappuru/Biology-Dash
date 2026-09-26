/**
 * Biology Dash: Immune Patrol
 * Tactical Hold-to-Charge Medicine Targeting Overlay & Shockwave FX
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

    // 1. Render Bullet-Time Targeting Brackets while charging
    if (isCharging) {
      // Vignette / Bullet-time tint
      this.graphics.fillStyle(0x05151f, 0.35);
      this.graphics.fillRect(0, 0, 420, 780);

      // Charge bar radial / ring around center
      const centerX = 210;
      const centerY = 400;
      this.graphics.lineStyle(4, 0x55efc4, 0.4);
      this.graphics.strokeCircle(centerX, centerY, 50);

      const angleEnd = -Math.PI / 2 + Math.PI * 2 * Math.min(1, chargeProgress);
      this.graphics.lineStyle(6, 0x55efc4, 0.95);
      this.graphics.beginPath();
      this.graphics.arc(centerX, centerY, 50, -Math.PI / 2, angleEnd, false);
      this.graphics.strokePath();

      // Scan and bracket microbes
      for (const m of simState.microbes) {
        const proj = projectCorridorToScreen(m.x, m.y);
        const isSusceptible = this.checkSusceptibility(m.species, equippedMed);

        if (isSusceptible) {
          // Glowing cyan target brackets [ ]
          this.graphics.lineStyle(2.5, 0x55efc4, 0.9);
          const s = 18 * proj.scale;
          // Top-left
          this.graphics.beginPath();
          this.graphics.moveTo(proj.x - s, proj.y - s + 6);
          this.graphics.lineTo(proj.x - s, proj.y - s);
          this.graphics.lineTo(proj.x - s + 6, proj.y - s);
          // Top-right
          this.graphics.moveTo(proj.x + s - 6, proj.y - s);
          this.graphics.lineTo(proj.x + s, proj.y - s);
          this.graphics.lineTo(proj.x + s, proj.y - s + 6);
          // Bottom-left
          this.graphics.moveTo(proj.x - s, proj.y + s - 6);
          this.graphics.lineTo(proj.x - s, proj.y + s);
          this.graphics.lineTo(proj.x - s + 6, proj.y + s);
          // Bottom-right
          this.graphics.moveTo(proj.x + s - 6, proj.y + s);
          this.graphics.lineTo(proj.x + s, proj.y + s);
          this.graphics.lineTo(proj.x + s, proj.y + s - 6);
          this.graphics.strokePath();
        } else {
          // Slashed circle / shield resistance mark ⊘
          this.graphics.lineStyle(2, 0xff7675, 0.85);
          const r = 12 * proj.scale;
          this.graphics.strokeCircle(proj.x, proj.y, r);
          this.graphics.lineBetween(proj.x - r * 0.7, proj.y - r * 0.7, proj.x + r * 0.7, proj.y + r * 0.7);
        }
      }
    }

    // 2. Render expanding shockwave pulse on release
    if (this.isPulsing) {
      this.pulseRadius += 850 * dt;
      const alpha = Math.max(0, 1 - this.pulseRadius / 650);

      this.graphics.lineStyle(8, this.pulseColor, alpha);
      this.graphics.strokeCircle(210, this.pulseOriginY, this.pulseRadius);

      this.graphics.lineStyle(3, 0xffffff, alpha * 0.8);
      this.graphics.strokeCircle(210, this.pulseOriginY, this.pulseRadius * 0.95);

      if (this.pulseRadius >= 650) {
        this.isPulsing = false;
        this.pulseRadius = 0;
      }
    }
  }

  public triggerPulse(color: number = 0x55efc4, originY: number = 700): void {
    this.isPulsing = true;
    this.pulseRadius = 10;
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
