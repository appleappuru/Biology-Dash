/**
 * Biology Dash: Immune Patrol
 * Storybook Campaign Map, Squad Barracks & Field Guide Screens
 */

import { AUTHORED_PATROLS } from '../core/content';
import { MEDICAL_EVIDENCE_RECORDS, MEDICAL_DISCLAIMER } from '../core/evidence';
import { GameSaveSchema } from '../core/types';
import { purchaseUpgrade } from '../storage/save';
import {
  iconCoin3D,
  iconStar3D,
  iconLock3D,
  iconPlay3D,
  iconUpgradeCategory3D,
  iconInfo3D,
} from './icons';

export class ScreenManager {
  private container: HTMLElement;
  private save: GameSaveSchema;
  private onSelectPatrol: (patrolId: number) => void;

  constructor(
    parent: HTMLElement,
    save: GameSaveSchema,
    onSelectPatrol: (patrolId: number) => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'screens-container';
    this.save = save;
    this.onSelectPatrol = onSelectPatrol;
    parent.appendChild(this.container);
  }

  public showCampaign(): void {
    this.container.style.display = 'block';
    this.container.innerHTML = `
      <div class="screen-view campaign-screen">
        <div class="campaign-header">
          <div class="title-with-coins">
            <h1 class="logo-title">BIOLOGY DASH</h1>
            <div class="coin-counter"><span class="coin-icon-wrapper">${iconCoin3D(18)}</span> <span class="coin-val">${this.save.coins}</span></div>
          </div>
          <div class="nav-tabs-row">
            <button class="nav-tab active" id="tab-campaign">Campaign</button>
            <button class="nav-tab" id="tab-barracks">Barracks</button>
            <button class="nav-tab" id="tab-guide">Field Guide</button>
          </div>
        </div>

        <div class="campaign-scroll-area">
          <div class="patrol-cards-list">
            ${AUTHORED_PATROLS.map((p) => {
              const isUnlocked = this.save.patrolsCompleted.includes(p.id);
              const stars = this.save.patrolStars[p.id] || 0;
              const starsHtml = [1, 2, 3].map((s) => iconStar3D(s <= stars, 16)).join('');

              return `
                <div class="patrol-card ${isUnlocked ? 'unlocked' : 'locked'}" data-id="${p.id}">
                  <div class="patrol-card-left">
                    <span class="patrol-badge">P${p.id}</span>
                  </div>
                  <div class="patrol-card-center">
                    <h3 class="patrol-card-title">${p.name}</h3>
                    <span class="patrol-card-sub">${p.subtitle}</span>
                    ${isUnlocked ? `<div class="card-stars">${starsHtml}</div>` : ''}
                  </div>
                  <div class="patrol-card-right">
                    ${
                      isUnlocked
                        ? `<button class="deploy-mini-btn">PLAY ${iconPlay3D(12)}</button>`
                        : `<span class="lock-icon">${iconLock3D(16)}</span>`
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindNavTabs();

    this.container.querySelectorAll('.patrol-card.unlocked').forEach((card) => {
      card.addEventListener('click', () => {
        const id = Number(card.getAttribute('data-id'));
        if (id) {
          this.hide();
          this.onSelectPatrol(id);
        }
      });
    });
  }

  public showBarracks(): void {
    const upgradeCategories: { key: keyof GameSaveSchema['upgrades']; title: string; desc: string }[] = [
      { key: 'speed', title: 'Extravasation Speed', desc: 'Accelerates squad maneuverability and frontline response' },
      { key: 'reach', title: 'Pseudopod Reach', desc: 'Increases phagocytic engulfment radius for neutrophils & macrophages' },
      { key: 'initialSquad', title: 'Starting Squad Size', desc: 'Deploys extra recruit cells at the start of each patrol' },
      { key: 'cytokineRate', title: 'Cytokine Synthesis', desc: 'Charges Titan Macrophage Cytokine Surge meter faster' },
    ];

    const upgradeCards = upgradeCategories.map((u) => {
      const lvl = this.save.upgrades[u.key];
      const cost = Math.floor(40 * Math.pow(1.65, lvl - 1));
      const canAfford = this.save.coins >= cost && lvl < 10;

      return `
        <div class="barracks-card">
          <div class="barracks-card-icon">${iconUpgradeCategory3D(u.key, 34)}</div>
          <div class="barracks-card-info">
            <span class="barracks-card-title">${u.title} (Lvl ${lvl}/10)</span>
            <span class="barracks-card-desc">${u.desc}</span>
          </div>
          <button class="upgrade-btn ${canAfford ? 'affordable' : 'disabled'}" data-key="${u.key}">
            ${lvl >= 10 ? 'MAX' : `${cost} ${iconCoin3D(14)}`}
          </button>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="screen-view barracks-screen">
        <div class="campaign-header">
          <div class="title-with-coins">
            <h1 class="logo-title">SQUAD BARRACKS</h1>
            <div class="coin-counter"><span class="coin-icon-wrapper">${iconCoin3D(18)}</span> <span class="coin-val">${this.save.coins}</span></div>
          </div>
          <div class="nav-tabs-row">
            <button class="nav-tab" id="tab-campaign">Campaign</button>
            <button class="nav-tab active" id="tab-barracks">Barracks</button>
            <button class="nav-tab" id="tab-guide">Field Guide</button>
          </div>
        </div>

        <div class="campaign-scroll-area">
          <div class="barracks-list">
            ${upgradeCards}
          </div>
        </div>
      </div>
    `;

    this.bindNavTabs();

    this.container.querySelectorAll('.upgrade-btn.affordable').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key') as keyof GameSaveSchema['upgrades'];
        if (key && purchaseUpgrade(this.save, key)) {
          this.showBarracks(); // re-render
        }
      });
    });
  }

  public showFieldGuide(): void {
    const records = MEDICAL_EVIDENCE_RECORDS.map((r) => `
      <div class="guide-record-card">
        <div class="record-header">
          <span class="record-category ${r.category}">${r.category.toUpperCase()}</span>
          <h3 class="record-name">${r.name}</h3>
        </div>
        <span class="record-sci">${r.scientificName}</span>
        <p class="record-p"><strong>Mechanism:</strong> ${r.mechanism}</p>
        <p class="record-p"><strong>Clinical Relevance:</strong> ${r.clinicalRelevance}</p>
        <p class="record-p notes"><strong>Activity:</strong> ${r.spectrumNotes}</p>
      </div>
    `).join('');

    this.container.innerHTML = `
      <div class="screen-view guide-screen">
        <div class="campaign-header">
          <div class="title-with-coins">
            <h1 class="logo-title">FIELD GUIDE</h1>
            <div class="coin-counter"><span class="coin-icon-wrapper">${iconCoin3D(18)}</span> <span class="coin-val">${this.save.coins}</span></div>
          </div>
          <div class="nav-tabs-row">
            <button class="nav-tab" id="tab-campaign">Campaign</button>
            <button class="nav-tab" id="tab-barracks">Barracks</button>
            <button class="nav-tab active" id="tab-guide">Field Guide</button>
          </div>
        </div>

        <div class="campaign-scroll-area">
          <div class="guide-list">
            <div class="guide-disclaimer-box">
              <span class="disc-icon">${iconInfo3D(18)}</span>
              <p>${MEDICAL_DISCLAIMER}</p>
            </div>
            ${records}
          </div>
        </div>
      </div>
    `;

    this.bindNavTabs();
  }

  private bindNavTabs(): void {
    this.container.querySelector('#tab-campaign')?.addEventListener('click', () => this.showCampaign());
    this.container.querySelector('#tab-barracks')?.addEventListener('click', () => this.showBarracks());
    this.container.querySelector('#tab-guide')?.addEventListener('click', () => this.showFieldGuide());
  }

  public hide(): void {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}
