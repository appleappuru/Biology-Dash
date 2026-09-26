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
} from '../audio/sound-palette';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './projection';

export class PatrolScene extends Phaser.Scene {
  private simState!: SimulationState;
  private patrolConfig!: PatrolConfig;

  private swarmView!: SwarmView;
  private enemyView!: EnemyView;
  private gateView!: GateView;

  private bgImage!: Phaser.GameObjects.Image;
  private juiceGraphics!: Phaser.GameObjects.Graphics;

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
    this.load.spritesheet('defenders', '/assets/defenders-simple-v1.svg', {
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
    }
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(0.05, delta / 1000);

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
    this.renderJuice();

    // 6. Notify UI
    if (this.onStateChange) {
      this.onStateChange(this.simState);
    }
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
