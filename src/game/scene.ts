/**
 * Biology Dash: Immune Patrol
 * Main Phaser Game Scene & Controller
 */

import Phaser from 'phaser';
import { SimulationState, PatrolConfig } from '../core/types';
import { createSimulation, tickSimulation } from '../simulation/simulation';
import { SwarmView } from './swarm-view';
import { EnemyView } from './enemy-view';
import { GateView } from './gate-view';
import { CombatOverlay } from './combat-overlay';
import { globalJuice } from './juice';
import { generate3DClayMicrobeAtlas } from './asset-loader';
import {
  playSwarmPop,
  playComboChime,
  playGateClonerChime,
  playBiofilmCrack,
  playCytokineRoar,
  playPinataFanfare,
  playDefeatLullaby,
  playChargeReady,
} from '../audio/sound-palette';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './projection';
import { fireMedicineWave, triggerCytokineSurge } from '../simulation/simulation';

export class PatrolScene extends Phaser.Scene {
  private simState!: SimulationState;
  private patrolConfig!: PatrolConfig;

  private swarmView!: SwarmView;
  private enemyView!: EnemyView;
  private gateView!: GateView;
  private combatOverlay!: CombatOverlay;

  private bgImage!: Phaser.GameObjects.Image;
  private juiceGraphics!: Phaser.GameObjects.Graphics;

  // Medicine hold-to-charge state
  private isChargingMedicine: boolean = false;
  private chargeProgress: number = 0;
  private chargeReadyPlayed: boolean = false;
  private equippedMedicine: any = 'amoxicillin';

  // Input tracking
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private inputDeltaX: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };

  // Callbacks for UI sync
  private onStateChange?: (state: SimulationState) => void;

  constructor() {
    super('PatrolScene');
  }

  public init(data: { config: PatrolConfig; onStateChange?: (state: SimulationState) => void }): void {
    this.patrolConfig = data.config;
    this.onStateChange = data.onStateChange;
    this.simState = createSimulation(this.patrolConfig);
  }

  public preload(): void {
    this.load.image('corridor_bg', '/assets/tissue-perspective-v2.png');
    this.load.spritesheet('defenders_3d', '/assets/defenders-simple-v1.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet('defenders', '/assets/defenders-simple-v1.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  public create(): void {
    // Generate 3D clay shaded textures
    generate3DClayMicrobeAtlas(this);
    // 1. Background corridor
    this.bgImage = this.add.image(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2, 'corridor_bg');
    this.bgImage.setDisplaySize(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    this.bgImage.setDepth(0);

    // 2. View layers
    this.gateView = new GateView(this);
    this.enemyView = new EnemyView(this);
    this.swarmView = new SwarmView(this);
    this.combatOverlay = new CombatOverlay(this);

    // 3. Juice renderers
    this.juiceGraphics = this.add.graphics();
    this.juiceGraphics.setDepth(25);

    // 4. Input setup (Relative pointer drag)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      this.lastPointerX = pointer.x;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerDown) {
        const dx = pointer.x - this.lastPointerX;
        this.inputDeltaX += dx * 1.15;
        this.lastPointerX = pointer.x;
      }
    });

    this.input.on('pointerup', () => {
      this.isPointerDown = false;
    });

    // Keyboard controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }) as any;

      // Spacebar for hold-to-charge medicine
      this.input.keyboard.on('keydown-SPACE', () => {
        this.startMedicineCharge();
      });
      this.input.keyboard.on('keyup-SPACE', () => {
        this.releaseMedicineCharge();
      });
      // 'E' or 'C' for Cytokine Surge
      this.input.keyboard.on('keydown-E', () => {
        this.activateCytokineSurge();
      });
    }
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);

    // Handle medicine charging bullet-time
    if (this.isChargingMedicine) {
      this.chargeProgress += dt / 1.2; // 1.2s to full charge
      if (this.chargeProgress >= 1.0 && !this.chargeReadyPlayed) {
        this.chargeReadyPlayed = true;
        playChargeReady();
        globalJuice.spawnCallout('READY!', 210, 360, '#55efc4');
      }
    }

    // Handle Keyboard input
    if (this.cursors || this.wasdKeys) {
      if (this.cursors.left?.isDown || this.wasdKeys.left?.isDown) {
        this.inputDeltaX -= 260 * dt;
      }
      if (this.cursors.right?.isDown || this.wasdKeys.right?.isDown) {
        this.inputDeltaX += 260 * dt;
      }
    }

    // 1. Tick deterministic simulation
    tickSimulation(this.simState, this.patrolConfig, this.inputDeltaX, dt);
    this.inputDeltaX = 0; // reset delta consumed

    // 2. Process simulation events for audio & juice
    this.handleSimulationEvents();

    // 3. Update juice engine
    globalJuice.update(dt);

    // 4. Apply camera screen shake
    const shake = globalJuice.getShakeOffset();
    this.cameras.main.setScroll(-shake.x, -shake.y);

    // 5. Render view layers
    this.gateView.render(this.simState.gates, this.simState.biofilms);
    this.enemyView.render(this.simState.microbes, this.simState.colonyBoss);
    this.swarmView.render(this.simState.cells, this.simState.champions);
    this.combatOverlay.render(
      this.simState,
      this.isChargingMedicine,
      this.chargeProgress,
      this.equippedMedicine,
      dt
    );
    this.renderJuice();

    // 6. Notify UI
    if (this.onStateChange) {
      this.onStateChange(this.simState);
    }
  }

  public startMedicineCharge(): void {
    this.isChargingMedicine = true;
    this.chargeProgress = 0;
    this.chargeReadyPlayed = false;
    this.simState.bulletTimeActive = true;
  }

  public releaseMedicineCharge(): void {
    if (!this.isChargingMedicine) return;
    this.isChargingMedicine = false;
    this.simState.bulletTimeActive = false;

    if (this.chargeProgress >= 0.4) {
      // Fire tactical wave!
      const result = fireMedicineWave(this.simState, this.equippedMedicine);
      this.combatOverlay.triggerPulse(0x55efc4, this.simState.squadCenter.y);
      globalJuice.triggerScreenShake(8, 0.3);

      if (result.affectedCount > 0) {
        globalJuice.spawnCallout(`SHATTERED ${result.affectedCount}!`, 210, 320, '#55efc4');
      } else if (result.resistantCount > 0) {
        globalJuice.spawnCallout('RESISTED ⊘', 210, 320, '#ff7675');
      }
    }
    this.chargeProgress = 0;
  }

  public activateCytokineSurge(): boolean {
    const success = triggerCytokineSurge(this.simState);
    if (success) {
      this.handleSimulationEvents();
    }
    return success;
  }

  public setEquippedMedicine(med: any): void {
    this.equippedMedicine = med;
  }

  private handleSimulationEvents(): void {
    for (const evt of this.simState.events) {
      switch (evt.type) {
        case 'microbe_engulfed':
          playSwarmPop(evt.data?.combo || 0);
          if (evt.data?.combo && evt.data.combo >= 2) {
            playComboChime(evt.data.combo);
          }
          if (evt.data?.microbe) {
            globalJuice.spawnStarBurst(evt.data.microbe.x, evt.data.microbe.y, 6);
          }
          break;
        case 'gate_hit':
          playGateClonerChime();
          globalJuice.spawnCallout(
            evt.data?.gate?.label || 'CLONE!',
            this.simState.squadCenter.x,
            this.simState.squadCenter.y - 30,
            '#55efc4'
          );
          globalJuice.triggerScreenShake(3, 0.2);
          break;
        case 'biofilm_burst':
          playBiofilmCrack();
          globalJuice.triggerScreenShake(8, 0.35);
          globalJuice.spawnCallout('+20 COINS!', evt.data?.x || 210, evt.data?.y || 400, '#ffeaa7');
          break;
        case 'champion_spawned':
          playCytokineRoar();
          globalJuice.triggerScreenShake(10, 0.4);
          globalJuice.spawnCallout('GIGA HUGGER!', 210, 500, '#ffeaa7');
          break;
        case 'colony_burst':
          playPinataFanfare();
          globalJuice.triggerScreenShake(14, 0.6);
          globalJuice.spawnStarBurst(210, 200, 36);
          break;
        case 'cell_lost':
          playDefeatLullaby();
          break;
      }
    }
  }

  private renderJuice(): void {
    this.juiceGraphics.clear();

    // Render star particles
    for (const p of globalJuice.particles) {
      const colorNum = parseInt(p.color.replace('#', '0x'), 16);
      this.juiceGraphics.fillStyle(colorNum, p.alpha);
      this.juiceGraphics.fillCircle(p.x, p.y, p.size / 2);
    }
  }

  public getSimulationState(): SimulationState {
    return this.simState;
  }
}
