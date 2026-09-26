/**
 * Biology Dash: Immune Patrol
 * Candy Glassmorphic HUD Layer
 */

import { SimulationState, MedicineType } from '../core/types';
import {
  iconHeart3D,
  iconKit3D,
  iconPause3D,
  iconSurge3D,
  iconCapsule3D,
} from './icons';

export interface HudCallbacks {
  onStartCharge: () => void;
  onReleaseCharge: () => void;
  onSurgeClick: () => void;
  onPauseClick: () => void;
  onCareKitClick: () => void;
}

export class CandyHUD {
  private container: HTMLElement;
  private squadBadge!: HTMLElement;
  private surgeBtn!: HTMLElement;
  private surgeFill!: HTMLElement;
  private medChargeBtn!: HTMLElement;
  private medLabel!: HTMLElement;
  private medSymbolEl!: HTMLElement;
  private progressFill!: HTMLElement;
  private lastSquadCount: number = 0;
  private callbacks: HudCallbacks;

  constructor(parent: HTMLElement, callbacks: HudCallbacks) {
    this.container = document.createElement('div');
    this.container.className = 'candy-hud';
    this.callbacks = callbacks;
    this.renderLayout();
    parent.appendChild(this.container);
  }

  private renderLayout(): void {
    this.container.innerHTML = `
      <div class="hud-top">
        <div class="hud-left">
          <div class="squad-badge" id="squad-badge">
            <span class="badge-icon">${iconHeart3D(20)}</span>
            <span class="badge-count" id="squad-count">6</span>
          </div>
        </div>
        <div class="hud-center">
          <div class="progress-capsule">
            <div class="progress-bar-fill" id="patrol-progress"></div>
          </div>
        </div>
        <div class="hud-right">
          <button class="hud-circle-btn" id="care-kit-btn" title="Open Care Kit">${iconKit3D(20)}</button>
          <button class="hud-circle-btn" id="pause-btn" title="Pause Game">${iconPause3D(18)}</button>
        </div>
      </div>

      <div class="hud-bottom">
        <div class="hud-controls-row">
          <button class="surge-circle-btn" id="surge-btn" disabled title="Cytokine Surge">
            <div class="surge-ring-fill" id="surge-fill"></div>
            <span class="surge-icon">${iconSurge3D(24)}</span>
            <span class="surge-label">SURGE</span>
          </button>

          <button class="med-charge-bar-btn" id="med-charge-btn">
            <div class="charge-indicator-glow"></div>
            <div class="med-btn-content">
              <span class="med-symbol" id="med-symbol">${iconCapsule3D('#55efc4', '#ffffff', 26)}</span>
              <div class="med-text-group">
                <span class="med-action">HOLD TO CHARGE</span>
                <span class="med-name" id="med-name">AMOXICILLIN</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    `;

    this.squadBadge = this.container.querySelector('#squad-badge')!;
    this.surgeBtn = this.container.querySelector('#surge-btn')!;
    this.surgeFill = this.container.querySelector('#surge-fill')!;
    this.medChargeBtn = this.container.querySelector('#med-charge-btn')!;
    this.medLabel = this.container.querySelector('#med-name')!;
    this.medSymbolEl = this.container.querySelector('#med-symbol')!;
    this.progressFill = this.container.querySelector('#patrol-progress')!;

    // Event listeners
    this.container.querySelector('#pause-btn')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onPauseClick();
    });

    this.container.querySelector('#care-kit-btn')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onCareKitClick();
    });

    this.surgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onSurgeClick();
    });

    // Touch & pointer events for hold-to-charge button
    const startCharge = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.medChargeBtn.classList.add('charging');
      this.callbacks.onStartCharge();
    };

    const endCharge = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      this.medChargeBtn.classList.remove('charging');
      this.callbacks.onReleaseCharge();
    };

    this.medChargeBtn.addEventListener('pointerdown', startCharge);
    this.medChargeBtn.addEventListener('pointerup', endCharge);
    this.medChargeBtn.addEventListener('pointerleave', endCharge);
    this.medChargeBtn.addEventListener('pointercancel', endCharge);
  }

  public update(state: SimulationState, equippedMed: MedicineType): void {
    const squadCount = state.cells.length;
    const countEl = this.container.querySelector('#squad-count');
    if (countEl) {
      countEl.textContent = String(squadCount);
    }

    // Squash bounce on squad size change
    if (squadCount !== this.lastSquadCount) {
      this.lastSquadCount = squadCount;
      this.squadBadge.classList.remove('bounce-badge');
      void this.squadBadge.offsetWidth;
      this.squadBadge.classList.add('bounce-badge');
    }

    // Progress bar fill
    const progress = Math.min(1, state.timeSeconds / state.patrolDuration);
    this.progressFill.style.width = `${progress * 100}%`;

    // Cytokine Surge Button & Fill
    const surgeRatio = state.cytokineMeter / state.cytokineMax;
    this.surgeFill.style.height = `${surgeRatio * 100}%`;

    if (state.isSurgeReady) {
      this.surgeBtn.removeAttribute('disabled');
      this.surgeBtn.classList.add('surge-ready');
    } else {
      this.surgeBtn.setAttribute('disabled', 'true');
      this.surgeBtn.classList.remove('surge-ready');
    }

    // Medicine Label and 3D Symbol
    this.medLabel.textContent = equippedMed.toUpperCase();
    if (this.medSymbolEl) {
      const topColor = equippedMed === 'doxycycline' ? '#81ecec' : equippedMed === 'cefepime' ? '#a29bfe' : equippedMed === 'micafungin' ? '#ff7675' : '#55efc4';
      const botColor = equippedMed === 'doxycycline' ? '#ffd43b' : '#ffffff';
      this.medSymbolEl.innerHTML = iconCapsule3D(topColor, botColor, 26);
    }
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  public destroy(): void {
    this.container.remove();
  }
}
