/**
 * Biology Dash: Immune Patrol
 * Victory Piñata, Defeat, Pause & Briefing Modals
 */

import confetti from 'canvas-confetti';
import { PatrolConfig, SimulationState } from '../core/types';
import {
  iconStar3D,
  iconParty3D,
  iconCoin3D,
  iconPlay3D,
  iconSleep3D,
  iconLightbulb3D,
  iconRetry3D,
  iconRocket3D,
  iconMap3D,
} from './icons';

export function showVictoryModal(
  parent: HTMLElement,
  _config: PatrolConfig,
  state: SimulationState,
  onNext: () => void,
  onMenu: () => void
): void {
  // Fire celebratory victory confetti shower
  try {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffeaa7', '#55efc4', '#ff7675', '#a29bfe', '#74b9ff'],
    });
  } catch (_e) {}

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop victory-modal';

  const stars = state.score >= 1500 ? 3 : state.score >= 800 ? 2 : 1;
  const starsHtml = [1, 2, 3].map((s) => iconStar3D(s <= stars, 28)).join('');

  modal.innerHTML = `
    <div class="candy-modal-card victory-card">
      <div class="pinata-burst-badge"><span class="badge-icon">${iconParty3D(18)}</span> COLONY DESTROYED!</div>
      <h1 class="victory-title">PATROL CLEARED!</h1>
      <div class="victory-stars">${starsHtml}</div>

      <div class="victory-stats-box">
        <div class="stat-line">
          <span class="stat-name">Surviving Swarm:</span>
          <span class="stat-val">${state.cells.length} cells</span>
        </div>
        <div class="stat-line">
          <span class="stat-name">Microbes Engulfed:</span>
          <span class="stat-val">${Math.floor(state.score / 100)}</span>
        </div>
        <div class="stat-line">
          <span class="stat-name">Coins Earned:</span>
          <span class="stat-val highlight">+${state.coinsEarned} <span class="coin-icon-inline">${iconCoin3D(16)}</span></span>
        </div>
        <div class="stat-line">
          <span class="stat-name">Final Score:</span>
          <span class="stat-val highlight">${state.score} pts</span>
        </div>
      </div>

      <div class="modal-buttons-row">
        <button class="candy-btn secondary" id="victory-menu-btn">Campaign</button>
        <button class="candy-btn primary" id="victory-next-btn">Next Patrol <span class="btn-icon-inline">${iconPlay3D(14)}</span></button>
      </div>
    </div>
  `;

  parent.appendChild(modal);

  modal.querySelector('#victory-next-btn')!.addEventListener('click', () => {
    modal.remove();
    onNext();
  });
  modal.querySelector('#victory-menu-btn')!.addEventListener('click', () => {
    modal.remove();
    onMenu();
  });
}

export function showDefeatModal(
  parent: HTMLElement,
  config: PatrolConfig,
  onRetry: () => void,
  onMenu: () => void
): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop defeat-modal';

  modal.innerHTML = `
    <div class="candy-modal-card defeat-card">
      <div class="nap-badge"><span class="badge-icon">${iconSleep3D(18)}</span> REST UP, TINY HEROES</div>
      <h1 class="defeat-title">Tissue Breach!</h1>
      <p class="defeat-desc">The pathogen swarm breached the tissue threshold. Your defenders are resting in the lymph nodes.</p>

      <div class="clinical-tip-box">
        <span class="tip-header"><span class="tip-icon">${iconLightbulb3D(16)}</span> Clinical Tip:</span>
        <p class="tip-body">${config.briefing.tip}</p>
      </div>

      <div class="modal-buttons-row">
        <button class="candy-btn secondary" id="defeat-menu-btn">Campaign</button>
        <button class="candy-btn primary" id="defeat-retry-btn">Try Again <span class="btn-icon-inline">${iconRetry3D(14)}</span></button>
      </div>
    </div>
  `;

  parent.appendChild(modal);

  modal.querySelector('#defeat-retry-btn')!.addEventListener('click', () => {
    modal.remove();
    onRetry();
  });
  modal.querySelector('#defeat-menu-btn')!.addEventListener('click', () => {
    modal.remove();
    onMenu();
  });
}

export function showBriefingModal(
  parent: HTMLElement,
  config: PatrolConfig,
  onStart: () => void
): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop briefing-modal';

  modal.innerHTML = `
    <div class="candy-modal-card briefing-card">
      <div class="briefing-header">
        <span class="patrol-num">${config.name}</span>
        <h2 class="briefing-subtitle">${config.subtitle}</h2>
      </div>

      <div class="briefing-content">
        <div class="briefing-section">
          <span class="sec-label">Clinical Scenario</span>
          <p class="sec-text">${config.briefing.clinicalContext}</p>
        </div>

        <div class="briefing-section">
          <span class="sec-label">Target Pathogen</span>
          <p class="sec-text highlight">${config.briefing.targetOrganism}</p>
        </div>

        <div class="briefing-section">
          <span class="sec-label">Recommended Care</span>
          <p class="sec-text drug">${config.briefing.recommendedDrug.toUpperCase()}</p>
        </div>
      </div>

      <button class="candy-btn primary full-width" id="briefing-start-btn">DEPLOY PATROL <span class="btn-icon-inline">${iconRocket3D(18)}</span></button>
    </div>
  `;

  parent.appendChild(modal);

  modal.querySelector('#briefing-start-btn')!.addEventListener('click', () => {
    modal.remove();
    onStart();
  });
}

export function showPauseModal(
  parent: HTMLElement,
  onResume: () => void,
  onRestart: () => void,
  onMenu: () => void
): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop pause-modal';

  modal.innerHTML = `
    <div class="candy-modal-card pause-card">
      <h2 class="pause-title">Patrol Paused</h2>
      <div class="modal-buttons-col">
        <button class="candy-btn primary" id="pause-resume-btn">Resume Patrol <span class="btn-icon-inline">${iconPlay3D(14)}</span></button>
        <button class="candy-btn secondary" id="pause-restart-btn">Restart <span class="btn-icon-inline">${iconRetry3D(14)}</span></button>
        <button class="candy-btn secondary" id="pause-menu-btn">Exit to Campaign <span class="btn-icon-inline">${iconMap3D(16)}</span></button>
      </div>
    </div>
  `;

  parent.appendChild(modal);

  modal.querySelector('#pause-resume-btn')!.addEventListener('click', () => {
    modal.remove();
    onResume();
  });
  modal.querySelector('#pause-restart-btn')!.addEventListener('click', () => {
    modal.remove();
    onRestart();
  });
  modal.querySelector('#pause-menu-btn')!.addEventListener('click', () => {
    modal.remove();
    onMenu();
  });
}
