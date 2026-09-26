/**
 * Biology Dash: Immune Patrol
 * 3/4 Isometric Perspective Microbe Horde & Colony Core Visualizer
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

      // 3/4 Directional ground shadow (flattened ellipse along Y)
      const shadowW = 28 * proj.scale;
      const shadowH = shadowW * 0.38;
      const shadowY = proj.y + 14 * proj.scale;

      this.shadowGraphics.fillStyle(0x020a10, 0.48);
      this.shadowGraphics.fillEllipse(proj.x, shadowY, shadowW, shadowH);

      let cont = this.enemySprites.get(m.id);
      if (!cont) {
        cont = this.createMicrobeContainer(m);
        this.container.add(cont);
        this.enemySprites.set(m.id, cont);
      }

      cont.setPosition(proj.x, proj.y);
      cont.setScale(proj.scale * 0.42);

      // White hit-flash effect when recently struck / dizzy
      const sprite = cont.getByName('sprite') as Phaser.GameObjects.Image;
      if (sprite) {
        if (m.dizzyTimer > 0) {
          sprite.setTint(0xffffff); // pure white hit-flash
        } else if (m.frozenTimer > 0) {
          sprite.setTint(0x81ecec); // cyan ice tint
        } else {
          sprite.clearTint();
        }
      }

      // Frozen overlay ice crystal
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
    sprite.setName('sprite');

    // 3D Frozen Ice Overlay (beveled diamond)
    const ice = this.scene.add.rectangle(0, 0, 72, 72, 0x81ecec, 0.35);
    ice.setStrokeStyle(2, 0xffffff, 0.8);
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

      // Colony Boss 3D Sprite
      const texKey = this.scene.textures.exists('microbes_3d') ? 'microbes_3d' : 'microbes';
      const sprite = this.scene.add.image(0, 0, texKey, 0);
      sprite.setScale(1.75);
      sprite.setName('boss_sprite');

      // 3D Volumetric Health Bar Chassis
      const barBg = this.scene.add.rectangle(0, -66, 172, 20, 0x09141f, 0.95);
      barBg.setStrokeStyle(3, 0x1e3a4f, 1);

      // Glowing Health Fill
      const barFill = this.scene.add.rectangle(-84, -66, 168, 14, 0xff7675, 1);
      barFill.setOrigin(0, 0.5);
      barFill.setName('hp_fill');

      // Frosted Glass Highlight on Health Bar
      const barGlass = this.scene.add.rectangle(0, -70, 168, 4, 0xffffff, 0.4);

      // Boss Title Pill
      const nameBg = this.scene.add.rectangle(0, -88, 150, 18, 0x1e293b, 0.9);
      nameBg.setStrokeStyle(1.5, 0xff7675);

      const nameText = this.scene.add.text(0, -88, 'COLONY CORE APEX', {
        fontSize: '10px',
        color: '#ff7675',
        fontStyle: '900',
        fontFamily: 'Fredoka, sans-serif',
      }).setOrigin(0.5);

      this.bossContainer.add([barBg, barFill, barGlass, sprite, nameBg, nameText]);
      this.container.add(this.bossContainer);
    }

    this.bossContainer.setPosition(proj.x, proj.y);
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    const fill = this.bossContainer.getByName('hp_fill') as Phaser.GameObjects.Rectangle;
    if (fill) {
      fill.width = 168 * hpRatio;
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
