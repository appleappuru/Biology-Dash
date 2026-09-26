/**
 * Biology Dash: Immune Patrol
 * 3/4 Isometric Perspective Swarm Visualizer
 * Renders 3D volumetric cells with directional drop shadows, dynamic banking,
 * and 3/4 perspective squash/stretch.
 */

import Phaser from 'phaser';
import { CellUnit, ChampionUnit } from '../core/types';
import { projectCorridorToScreen } from './projection';

export class SwarmView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadowGraphics: Phaser.GameObjects.Graphics;
  private cellSprites: Map<number, Phaser.GameObjects.Image> = new Map();
  private champSprites: Map<number, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(15);

    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(11);
  }

  public render(cells: CellUnit[], champions: ChampionUnit[]): void {
    this.shadowGraphics.clear();
    const activeIds = new Set<number>();

    // 1. Render all active squad cells
    for (const cell of cells) {
      activeIds.add(cell.id);
      const proj = projectCorridorToScreen(cell.x, cell.y);

      // 3/4 Directional ground contact shadow (flattened ellipse along Y)
      const shadowW = (cell.type === 'macrophage' ? 44 : 30) * proj.scale;
      const shadowH = shadowW * 0.38; // 3/4 isometric foreshortening
      const shadowY = proj.y + (cell.type === 'macrophage' ? 20 : 15) * proj.scale;

      this.shadowGraphics.fillStyle(0x020a10, 0.45);
      this.shadowGraphics.fillEllipse(proj.x, shadowY, shadowW, shadowH);

      // Inner darker core shadow
      this.shadowGraphics.fillStyle(0x010508, 0.35);
      this.shadowGraphics.fillEllipse(proj.x, shadowY, shadowW * 0.6, shadowH * 0.55);

      // Get or create sprite
      let sprite = this.cellSprites.get(cell.id);
      if (!sprite) {
        sprite = this.scene.add.image(proj.x, proj.y, 'defenders_3d', 0);
        this.container.add(sprite);
        this.cellSprites.set(cell.id, sprite);
      }

      // Update frame based on movement / banking
      const rowOffset = cell.type === 'macrophage' ? 4 : cell.type === 'plasma' ? 8 : 0;
      let col = 0;
      if (cell.state === 'engulfing' || cell.state === 'digesting') {
        col = 2; // 3/4 Engulf / hug pose
      } else if (Math.abs(cell.banking) > 0.15) {
        col = 1; // 3/4 Walking pose
      }

      const frameIdx = rowOffset + col;
      if (sprite.frame.name !== String(frameIdx)) {
        sprite.setFrame(frameIdx);
      }

      sprite.setPosition(proj.x, proj.y);
      const baseScale = cell.type === 'macrophage' ? 0.24 : cell.type === 'plasma' ? 0.21 : 0.19;
      const finalScaleX = proj.scale * cell.scale * cell.squashX * baseScale;
      const finalScaleY = proj.scale * cell.scale * cell.squashY * baseScale;
      sprite.setScale(finalScaleX, finalScaleY);
      sprite.setRotation(cell.banking * 0.2);
    }

    // Clean up pooled sprites of removed cells
    for (const [id, sprite] of this.cellSprites.entries()) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.cellSprites.delete(id);
      }
    }

    // 2. Render Champion Units (Titan Macrophage / Plasma Fairy Queen)
    const activeChampIds = new Set<number>();
    for (const champ of champions) {
      activeChampIds.add(champ.id);
      const proj = projectCorridorToScreen(champ.x, champ.y);

      let champObj = this.champSprites.get(champ.id);
      if (!champObj) {
        champObj = this.createChampionContainer(champ);
        this.container.add(champObj);
        this.champSprites.set(champ.id, champObj);
      }

      champObj.setPosition(proj.x, proj.y);
      const champScale = (champ.type === 'titan' ? 1.05 : 0.8) * proj.scale;
      champObj.setScale(champScale);

      // Heavy 3/4 perspective ground shadow for champion
      const cShadowW = 84 * proj.scale;
      const cShadowH = cShadowW * 0.36;
      this.shadowGraphics.fillStyle(0x020a10, 0.65);
      this.shadowGraphics.fillEllipse(proj.x, proj.y + 44 * proj.scale, cShadowW, cShadowH);
    }

    for (const [id, cObj] of this.champSprites.entries()) {
      if (!activeChampIds.has(id)) {
        cObj.destroy();
        this.champSprites.delete(id);
      }
    }
  }

  private createChampionContainer(champ: ChampionUnit): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(champ.x, champ.y);
    const sprite = this.scene.add.image(0, 0, 'defenders_3d', champ.type === 'titan' ? 7 : 11);
    sprite.setScale(champ.type === 'titan' ? 1.0 : 0.7);

    // 3D Beveled Title Badge
    const badge = this.scene.add.text(0, -60, champ.type === 'titan' ? 'GIGA HUGGER' : 'PLASMA QUEEN', {
      fontSize: '11px',
      color: '#ffd700',
      fontStyle: '900',
      fontFamily: 'Fredoka, sans-serif',
      backgroundColor: 'rgba(7, 24, 36, 0.85)',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);

    cont.add([sprite, badge]);
    return cont;
  }

  public destroy(): void {
    this.shadowGraphics.destroy();
    this.container.destroy();
    this.cellSprites.clear();
    this.champSprites.clear();
  }
}
