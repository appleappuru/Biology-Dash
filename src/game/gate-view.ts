/**
 * Biology Dash: Immune Patrol
 * Multiplier Gates & Biofilm Obstacle Visualizer
 */

import Phaser from 'phaser';
import { GateItem, BiofilmObstacle } from '../core/types';
import { projectCorridorToScreen } from './projection';

export class GateView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private gateContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private biofilmContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(13);
  }

  public render(gates: GateItem[], biofilms: BiofilmObstacle[]): void {
    const activeGateIds = new Set<string>();

    for (const gate of gates) {
      if (gate.triggered) continue;
      activeGateIds.add(gate.id);

      const proj = projectCorridorToScreen(gate.x, gate.y);

      let cont = this.gateContainers.get(gate.id);
      if (!cont) {
        cont = this.createGateContainer(gate);
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

    // Render Biofilm Obstacles
    const activeBiofilmIds = new Set<string>();
    for (const b of biofilms) {
      if (b.cracked || b.hp <= 0) continue;
      activeBiofilmIds.add(b.id);

      const proj = projectCorridorToScreen(b.x, b.y);

      let cont = this.biofilmContainers.get(b.id);
      if (!cont) {
        cont = this.createBiofilmContainer(b);
        this.container.add(cont);
        this.biofilmContainers.set(b.id, cont);
      }

      cont.setPosition(proj.x, proj.y);
      cont.setScale(proj.scale);

      const hpText = cont.getByName('hp_text') as Phaser.GameObjects.Text;
      if (hpText) {
        hpText.setText(`[HP: ${b.hp}]`);
      }
    }

    for (const [id, cont] of this.biofilmContainers.entries()) {
      if (!activeBiofilmIds.has(id)) {
        cont.destroy();
        this.biofilmContainers.delete(id);
      }
    }
  }

  private createGateContainer(gate: GateItem): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(0, 0);

    const isPositive = gate.op === 'multiply' || gate.op === 'add' || gate.op === 'turret';
    const isHazard = gate.op === 'divide' || gate.op === 'subtract';

    const baseColor = isPositive ? 0x0984e3 : isHazard ? 0xd63031 : 0x6c5ce7;
    const strokeColor = isPositive ? 0x74b9ff : isHazard ? 0xff7675 : 0xa29bfe;

    // Glowing gate panel
    const rect = this.scene.add.rectangle(0, 0, gate.width, gate.height, baseColor, 0.65);
    rect.setStrokeStyle(3, strokeColor, 0.95);

    // Specular shine line
    const shine = this.scene.add.line(0, -gate.height * 0.25, -gate.width * 0.4, 0, gate.width * 0.4, 0, 0xffffff, 0.6);
    shine.setLineWidth(2);

    // Gate operator & value text
    const label = this.scene.add.text(0, -6, gate.label, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Fredoka, sans-serif',
      stroke: '#05151f',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Subtitle
    const sublabel = this.scene.add.text(0, 14, gate.sublabel, {
      fontSize: '10px',
      color: '#dfe6e9',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: '600',
    }).setOrigin(0.5);

    cont.add([rect, shine, label, sublabel]);
    return cont;
  }

  private createBiofilmContainer(b: BiofilmObstacle): Phaser.GameObjects.Container {
    const cont = this.scene.add.container(0, 0);

    // Biofilm clustered barrier shape
    const rect = this.scene.add.rectangle(0, 0, b.width, b.height, 0x2d3436, 0.85);
    rect.setStrokeStyle(2.5, 0xfdcb6e, 0.9);

    const hpText = this.scene.add.text(0, -4, `[HP: ${b.hp}]`, {
      fontSize: '15px',
      color: '#ffeaa7',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    hpText.setName('hp_text');

    const rewardLabel = this.scene.add.text(0, 12, b.rewardType === 'coins' ? '+COINS' : '+HERO', {
      fontSize: '9px',
      color: '#55efc4',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    cont.add([rect, hpText, rewardLabel]);
    return cont;
  }

  public destroy(): void {
    this.container.destroy();
    this.gateContainers.clear();
    this.biofilmContainers.clear();
  }
}
