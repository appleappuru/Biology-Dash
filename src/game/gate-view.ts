/**
 * Biology Dash: Immune Patrol
 * 3D Volumetric Extruded Energy Gates & Organic Biofilm Barrels (3/4 Perspective)
 */

import Phaser from 'phaser';
import { GateItem, BiofilmObstacle } from '../core/types';
import { projectCorridorToScreen } from './projection';

export class GateView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadowGraphics: Phaser.GameObjects.Graphics;
  private gateContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private biofilmContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(13);

    this.shadowGraphics = scene.add.graphics();
    this.shadowGraphics.setDepth(10);
  }

  public render(gates: GateItem[], biofilms: BiofilmObstacle[]): void {
    this.shadowGraphics.clear();
    const activeGateIds = new Set<string>();

    for (const gate of gates) {
      if (gate.triggered) continue;
      activeGateIds.add(gate.id);

      const proj = projectCorridorToScreen(gate.x, gate.y);

      // 3/4 Perspective directional ground shadow beneath gate
      this.shadowGraphics.fillStyle(0x020a10, 0.45);
      this.shadowGraphics.fillRoundedRect(
        proj.x - (gate.width * 0.52) * proj.scale,
        proj.y + (gate.height * 0.45) * proj.scale,
        gate.width * 1.04 * proj.scale,
        14 * proj.scale,
        7 * proj.scale
      );

      let cont = this.gateContainers.get(gate.id);
      if (!cont) {
        cont = this.createVolumetricGateContainer(gate);
        this.container.add(cont);
        this.gateContainers.set(gate.id, cont);
      }

      cont.setPosition(proj.x, proj.y);
      cont.setScale(proj.scale);
    }

    for (const [id, cont] of this.gateContainers.entries()) {
      if (!activeGateIds.has(id)) {
        cont.destroy();
        this.gateContainers.delete(id);
      }
    }

    // Render 3D Biofilm Barrels
    const activeBiofilmIds = new Set<string>();
    for (const b of biofilms) {
      if (b.cracked || b.hp <= 0) continue;
      activeBiofilmIds.add(b.id);

      const proj = projectCorridorToScreen(b.x, b.y);

      // Directional 3/4 drop shadow for barrel
      this.shadowGraphics.fillStyle(0x020a10, 0.55);
      this.shadowGraphics.fillEllipse(
        proj.x,
        proj.y + (b.height * 0.48) * proj.scale,
        (b.width * 0.95) * proj.scale,
        (b.height * 0.38) * proj.scale
      );

      let cont = this.biofilmContainers.get(b.id);
      if (!cont) {
        cont = this.createVolumetricBiofilmContainer(b);
        this.container.add(cont);
        this.biofilmContainers.set(b.id, cont);
      }

      cont.setPosition(proj.x, proj.y);
      cont.setScale(proj.scale);

      const hpText = cont.getByName('hp_text') as Phaser.GameObjects.Text;
      if (hpText) {
        hpText.setText(String(b.hp));
      }
    }

    for (const [id, cont] of this.biofilmContainers.entries()) {
      if (!activeBiofilmIds.has(id)) {
        cont.destroy();
        this.biofilmContainers.delete(id);
      }
    }
  }

  private createVolumetricGateContainer(gate: GateItem): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(0, 0);

    const isPositive = gate.op === 'multiply' || gate.op === 'add' || gate.op === 'turret';
    const isHazard = gate.op === 'divide' || gate.op === 'subtract';

    const baseColor = isPositive ? 0x0984e3 : isHazard ? 0xd63031 : 0x6c5ce7;
    const rimColor = isPositive ? 0x55efc4 : isHazard ? 0xff7675 : 0xa29bfe;

    // 1. Back Acrylic Glass Base (Volumetric depth)
    const backWall = this.scene.add.rectangle(0, -3, gate.width, gate.height, 0x071b28, 0.7);
    backWall.setStrokeStyle(3, 0x1e3a4f, 0.8);

    // 2. Translucent Glowing Energy Field
    const energyField = this.scene.add.rectangle(0, 0, gate.width - 6, gate.height - 6, baseColor, 0.55);

    // 3. Top Specular Frosted Glass Lip (3/4 perspective top edge)
    const topLip = this.scene.add.rectangle(0, -gate.height / 2, gate.width, 6, 0xffffff, 0.75);
    const bottomShadow = this.scene.add.rectangle(0, gate.height / 2, gate.width, 4, 0x02070c, 0.65);

    // 4. Lateral Pillar Caps (3D Extrusion Runners)
    const leftPillar = this.scene.add.rectangle(-gate.width / 2 + 3, 0, 6, gate.height + 4, rimColor, 0.9);
    const rightPillar = this.scene.add.rectangle(gate.width / 2 - 3, 0, 6, gate.height + 4, rimColor, 0.9);

    // 5. 3D Beveled Value Label
    const labelShadow = this.scene.add.text(1, -5, gate.label, {
      fontSize: '24px',
      color: '#02070c',
      fontStyle: '900',
      fontFamily: 'Fredoka, sans-serif',
    }).setOrigin(0.5);

    const label = this.scene.add.text(0, -6, gate.label, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: '900',
      fontFamily: 'Fredoka, sans-serif',
      stroke: isPositive ? '#00cec9' : '#ff7675',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // 6. 3D Sublabel Badge
    const sublabel = this.scene.add.text(0, 16, gate.sublabel.toUpperCase(), {
      fontSize: '9px',
      color: '#ffffff',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: '800',
      backgroundColor: 'rgba(5, 21, 31, 0.75)',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    cont.add([backWall, energyField, topLip, bottomShadow, leftPillar, rightPillar, labelShadow, label, sublabel]);
    return cont;
  }

  private createVolumetricBiofilmContainer(b: BiofilmObstacle): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(0, 0);

    // 1. 3D Barrel Body (Dark resin cylinder with metallic bands)
    const barrelBody = this.scene.add.rectangle(0, 0, b.width, b.height, 0x1f2937, 0.95);
    barrelBody.setStrokeStyle(2.5, 0x4b5563, 0.9);

    // Metallic barrel hoops (3D extrusion rings)
    const topHoop = this.scene.add.rectangle(0, -b.height * 0.3, b.width, 4, 0xf59e0b, 0.85);
    const botHoop = this.scene.add.rectangle(0, b.height * 0.3, b.width, 4, 0xf59e0b, 0.85);

    // 2. 3D Bubbling Slime Top (tilted oval lid)
    const slimeLid = this.scene.add.ellipse(0, -b.height * 0.42, b.width * 0.9, 12, 0x10b981, 0.9);
    slimeLid.setStrokeStyle(1.5, 0x34d399, 1);

    // 3. Floating 3D Countdown Dial Badge (hovering above barrel at 3/4 tilt)
    const dialBg = this.scene.add.circle(0, 0, 18, 0x0f172a, 0.92);
    dialBg.setStrokeStyle(2.5, 0xf59e0b);

    const hpText = this.scene.add.text(0, 0, String(b.hp), {
      fontSize: '15px',
      color: '#fde047',
      fontStyle: '900',
      fontFamily: 'Fredoka, sans-serif',
    }).setOrigin(0.5);
    hpText.setName('hp_text');

    const rewardBadge = this.scene.add.text(0, b.height * 0.52, b.rewardType === 'coins' ? 'COINS' : 'HERO', {
      fontSize: '8px',
      color: '#ffffff',
      fontStyle: '800',
      fontFamily: 'Nunito, sans-serif',
      backgroundColor: '#059669',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5);

    cont.add([barrelBody, topHoop, botHoop, slimeLid, dialBg, hpText, rewardBadge]);
    return cont;
  }

  public destroy(): void {
    this.shadowGraphics.destroy();
    this.container.destroy();
    this.gateContainers.clear();
    this.biofilmContainers.clear();
  }
}
