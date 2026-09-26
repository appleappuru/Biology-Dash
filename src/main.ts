/**
 * Biology Dash: Immune Patrol
 * Main Application Orchestrator & Game Lifecycle
 */

import Phaser from 'phaser';
import { AUTHORED_PATROLS } from './core/content';
import { PatrolConfig, SimulationState, MedicineType, GameSaveSchema } from './core/types';
import { loadSave, recordPatrolVictory } from './storage/save';
import { PatrolScene } from './game/scene';
import { CandyHUD } from './ui/hud';
import { ScreenManager } from './ui/screens';
import { CareKitDrawer } from './ui/care-kit';
import {
  showVictoryModal,
  showDefeatModal,
  showPauseModal,
  showBriefingModal,
} from './ui/modals';
import { globalAudio } from './audio/bio-audio';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './game/projection';

export class GameApp {
  private save: GameSaveSchema;
  private currentPatrol: PatrolConfig = AUTHORED_PATROLS[0];
  private game: Phaser.Game | null = null;
  private currentScene: PatrolScene | null = null;
  private hud: CandyHUD | null = null;
  private screenManager: ScreenManager | null = null;
  private isModalActive: boolean = false;

  constructor() {
    this.save = loadSave();
  }

  public start(): void {
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;

    // First user gesture initializes procedural Web Audio
    const unlockAudio = () => {
      globalAudio.init();
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);

    // Screen Manager for Storybook Campaign Map, Barracks & Field Guide
    this.screenManager = new ScreenManager(uiLayer, this.save, (patrolId) => {
      const patrol = AUTHORED_PATROLS.find((p) => p.id === patrolId) || AUTHORED_PATROLS[0];
      this.currentPatrol = patrol;
      this.promptPatrolBriefing(patrol);
    });

    // Start on Campaign Screen
    this.screenManager.showCampaign();
  }

  private promptPatrolBriefing(config: PatrolConfig): void {
    const uiLayer = document.getElementById('ui-layer')!;
    showBriefingModal(uiLayer, config, () => {
      this.launchPatrol(config);
    });
  }

  private launchPatrol(config: PatrolConfig): void {
    const uiLayer = document.getElementById('ui-layer')!;
    const canvasContainer = document.getElementById('game-canvas-container')!;

    // Clean previous game if existing
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.currentScene = null;
    }

    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    this.isModalActive = false;

    // Create Candy HUD
    this.hud = new CandyHUD(uiLayer, {
      onStartCharge: () => {
        this.currentScene?.startMedicineCharge();
      },
      onReleaseCharge: () => {
        this.currentScene?.releaseMedicineCharge();
      },
      onSurgeClick: () => {
        this.currentScene?.activateCytokineSurge();
      },
      onPauseClick: () => {
        this.pauseGame();
      },
      onCareKitClick: () => {
        this.openCareKit();
      },
    });

    // Phaser Config
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      parent: canvasContainer,
      width: VIRTUAL_WIDTH,
      height: VIRTUAL_HEIGHT,
      backgroundColor: '#05151f',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      audio: {
        noAudio: true, // We use our own pure Web Audio synthesizer
      },
    };

    this.game = new Phaser.Game(phaserConfig);
    this.game.scene.add('PatrolScene', PatrolScene, true, {
      config,
      onStateChange: (state: SimulationState) => {
        this.handleStateUpdate(state);
      },
    });

    // Cache scene reference once started
    setTimeout(() => {
      this.currentScene = this.game?.scene.getScene('PatrolScene') as PatrolScene;
      this.currentScene?.setEquippedMedicine(this.save.equippedMedicine);
    }, 50);
  }

  private handleStateUpdate(state: SimulationState): void {
    if (this.isModalActive) return;

    if (this.hud) {
      this.hud.update(state, this.save.equippedMedicine);
    }

    // Check game outcome
    if (state.status === 'victory') {
      this.isModalActive = true;
      const stars = state.score >= 1500 ? 3 : state.score >= 800 ? 2 : 1;
      recordPatrolVictory(this.save, this.currentPatrol.id, stars, state.coinsEarned);

      const uiLayer = document.getElementById('ui-layer')!;
      showVictoryModal(
        uiLayer,
        this.currentPatrol,
        state,
        () => {
          // Next level
          const nextIdx = AUTHORED_PATROLS.findIndex((p) => p.id === this.currentPatrol.id) + 1;
          if (nextIdx < AUTHORED_PATROLS.length) {
            this.currentPatrol = AUTHORED_PATROLS[nextIdx];
            this.promptPatrolBriefing(this.currentPatrol);
          } else {
            this.exitToCampaign();
          }
        },
        () => {
          this.exitToCampaign();
        }
      );
    } else if (state.status === 'defeat') {
      this.isModalActive = true;
      const uiLayer = document.getElementById('ui-layer')!;
      showDefeatModal(
        uiLayer,
        this.currentPatrol,
        () => {
          this.launchPatrol(this.currentPatrol);
        },
        () => {
          this.exitToCampaign();
        }
      );
    }
  }

  private pauseGame(): void {
    if (this.isModalActive || !this.game) return;
    this.isModalActive = true;
    this.game.scene.pause('PatrolScene');

    const uiLayer = document.getElementById('ui-layer')!;
    showPauseModal(
      uiLayer,
      () => {
        this.isModalActive = false;
        this.game?.scene.resume('PatrolScene');
      },
      () => {
        this.isModalActive = false;
        this.launchPatrol(this.currentPatrol);
      },
      () => {
        this.isModalActive = false;
        this.exitToCampaign();
      }
    );
  }

  private openCareKit(): void {
    const uiLayer = document.getElementById('ui-layer')!;
    new CareKitDrawer(
      uiLayer,
      this.save,
      (newMed: MedicineType) => {
        this.currentScene?.setEquippedMedicine(newMed);
      },
      () => {}
    );
  }

  private exitToCampaign(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.currentScene = null;
    }
    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }
    this.isModalActive = false;
    this.screenManager?.showCampaign();
  }
}

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    app.start();
  });
}
