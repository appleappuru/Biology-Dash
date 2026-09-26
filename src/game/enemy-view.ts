/**
 * Biology Dash: Immune Patrol
 * Enemy Microbe Horde & Colony Core Visualizer
 */

import Phaser from 'phaser';
import { MicrobeUnit, MicrobeSpecies } from '../core/types';
import { projectCorridorToScreen } from './projection';

const SPECIES_FRAME_MAP: Record<MicrobeSpecies, number> = {
  s_aureus: 0,
  beta_lactamase_sa: 1,
  doxy_resistant_sa: 2,
  mrsa: 3,
  antigen_b_sa: 4,
  pneumococcus: 5,
  e_coli: 6,
  pseudomonas: 7,
  candida: 8,
};

export class EnemyView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadowGraphics: Phaser.GameObjects.Graphics;
  private enemySprites: Map<number, Phaser.GameObjects.Container> = new Map();
  private bossContainer: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(14);

    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(11);
  }

  public render(microbes: MicrobeUnit[], boss: MicrobeUnit | null): void {
    this.shadowGraphics.clear();
    const activeIds = new Set<number>();

    for (const m of microbes) {
      if (m.isBoss) continue;
      activeIds.add(m.id);

      const proj = projectCorridorToScreen(m.x, m.y);

      // Microbe ground shadow
      this.shadowGraphics.fillStyle(0x04131d, 0.38);
      this.shadowGraphics.fillEllipse(proj.x, proj.y + 14 * proj.scale, 24 * proj.scale, 10 * proj.scale);

      let cont = this.enemySprites.get(m.id);
      if (!cont) {
        cont = this.createMicrobeContainer(m);
        this.container.add(cont);
        this.enemySprites.set(m.id, cont);
      }

      cont.setPosition(proj.x, proj.y);
      cont.setScale(proj.scale * 0.42);

      // Dizzy or frozen effects
      const frozenOverlay = cont.getByName('frozen') as Phaser.GameObjects.Shape;
      if (frozenOverlay) {
        frozenOverlay.setVisible(m.frozenTimer > 0);
      }
    }

    // Clean up pooled enemies
    for (const [id, cont] of this.enemySprites.entries()) {
      if (!activeIds.has(id)) {
        cont.destroy();
        this.enemySprites.delete(id);
      }
    }

    // Render Boss Colony Core if present
    if (boss) {
      this.renderBoss(boss);
    } else if (this.bossContainer) {
      this.bossContainer.destroy();
      this.bossContainer = null;
    }
  }

  private createMicrobeContainer(m: MicrobeUnit): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(m.x, m.y);
    const frame = SPECIES_FRAME_MAP[m.species] ?? 0;
    const texKey = this.scene.textures.exists('microbes_3d') ? 'microbes_3d' : 'microbes';
    const sprite = this.scene.add.image(0, 0, texKey, frame);

    // Frozen ice crystal overlay shape
    const ice = this.scene.add.rectangle(0, 0, 70, 70, 0x81ecec, 0.4);
    ice.setName('frozen');
    ice.setVisible(false);

    cont.add([sprite, ice]);
    return cont;
  }

  private renderBoss(boss: MicrobeUnit): void {
    const proj = projectCorridorToScreen(boss.x, boss.y);

    if (!this.bossContainer) {
      this.bossContainer = this.scene.add.container(proj.x, proj.y);
      this.bossContainer.setDepth(20);

      // Colony Boss sprite
      const sprite = this.scene.add.image(0, 0, 'microbes', 0);
      sprite.setScale(1.6);
      sprite.setName('boss_sprite');

      // Health bar background
      const barBg = this.scene.add.rectangle(0, -60, 160, 16, 0x1e293b, 0.9);
      barBg.setStrokeStyle(2, 0xff7675);

      // Health fill
      const barFill = this.scene.add.rectangle(-80, -60, 160, 14, 0xff7675, 1);
      barFill.setOrigin(0, 0.5);
      barFill.setName('hp_fill');

      // Boss Name label
      const nameText = this.scene.add.text(0, -78, 'PATHOGEN COLONY CORE', {
        fontSize: '11px',
        color: '#ff7675',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.bossContainer.add([barBg, barFill, sprite, nameText]);
      this.container.add(this.bossContainer);
    }

    this.bossContainer.setPosition(proj.x, proj.y);
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    const fill = this.bossContainer.getByName('hp_fill') as Phaser.GameObjects.Rectangle;
    if (fill) {
      fill.width = 160 * hpRatio;
    }
  }

  public destroy(): void {
    this.shadowGraphics.destroy();
    this.container.destroy();
    this.enemySprites.clear();
    if (this.bossContainer) {
      this.bossContainer.destroy();
    }
  }
}
