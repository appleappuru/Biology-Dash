/**
 * Biology Dash: Immune Patrol
 * Bento-Box Style Care Kit Drawer (Medicines & Antibodies)
 */

import { GameSaveSchema, MedicineType } from '../core/types';
import { equipMedicine } from '../storage/save';

const MEDICINE_CATALOG: {
  id: MedicineType;
  name: string;
  class: string;
  icon: string;
  color: string;
  mechanism: string;
  targetOrganisms: string;
}[] = [
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    class: 'Aminopenicillin',
    icon: '💊',
    color: '#55efc4',
    mechanism: 'Inhibits bacterial transpeptidases to crack cell walls',
    targetOrganisms: 'S. aureus, Pneumococcus, E. coli',
  },
  {
    id: 'doxycycline',
    name: 'Doxycycline',
    class: 'Tetracycline',
    icon: '🧊',
    color: '#81ecec',
    mechanism: 'Binds 30S ribosomal subunit to freeze translation for 6s',
    targetOrganisms: 'Beta-lactamase+ bacteria, Atypical microbes',
  },
  {
    id: 'cefepime',
    name: 'Cefepime',
    class: '4th-Gen Cephalosporin',
    icon: '⚡',
    color: '#a29bfe',
    mechanism: 'Penetrates porins to bind PBP3 in resistant Gram-negatives',
    targetOrganisms: 'Pseudomonas aeruginosa, Enterobacteriaceae',
  },
  {
    id: 'micafungin',
    name: 'Micafungin',
    class: 'Echinocandin Antifungal',
    icon: '🍄',
    color: '#ff7675',
    mechanism: 'Inhibits 1,3-beta-D-glucan synthase in fungal cell walls',
    targetOrganisms: 'Candida albicans & Yeast (Zero antibacterial activity)',
  },
];

export class CareKitDrawer {
  private container: HTMLElement;
  private save: GameSaveSchema;
  private onClose: () => void;
  private onEquip: (med: MedicineType) => void;

  constructor(
    parent: HTMLElement,
    save: GameSaveSchema,
    onEquip: (med: MedicineType) => void,
    onClose: () => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'care-kit-drawer-overlay';
    this.save = save;
    this.onEquip = onEquip;
    this.onClose = onClose;
    this.render();
    parent.appendChild(this.container);
  }

  private render(): void {
    const medCards = MEDICINE_CATALOG.map((item) => {
      const isUnlocked = this.save.unlockedMedicines.includes(item.id);
      const isEquipped = this.save.equippedMedicine === item.id;

      return `
        <div class="bento-med-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-med="${item.id}">
          <div class="bento-card-header">
            <span class="med-icon" style="background: ${item.color}22; border-color: ${item.color}">${item.icon}</span>
            <div class="bento-title-group">
              <span class="med-card-name">${item.name}</span>
              <span class="med-card-class">${item.class}</span>
            </div>
            ${isEquipped ? '<span class="equipped-tag">EQUIPPED</span>' : ''}
          </div>
          <p class="bento-mech">${item.mechanism}</p>
          <div class="bento-target-row">
            <span class="target-label">Target:</span>
            <span class="target-text">${item.targetOrganisms}</span>
          </div>
          ${
            isUnlocked
              ? `<button class="bento-equip-btn ${isEquipped ? 'active' : ''}">${isEquipped ? 'In Use' : 'Equip'}</button>`
              : '<span class="locked-badge">🔒 Locked</span>'
          }
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="care-kit-modal">
        <div class="modal-header">
          <div class="header-left">
            <span class="modal-icon">🧰</span>
            <h2>Immune Care Kit</h2>
          </div>
          <button class="modal-close-btn" id="care-kit-close">✕</button>
        </div>
        <p class="care-kit-subtitle">Equip targeted antimicrobial agents based on microbiological susceptibility.</p>
        <div class="bento-grid">
          ${medCards}
        </div>
      </div>
    `;

    this.container.querySelector('#care-kit-close')!.addEventListener('click', () => {
      this.close();
    });

    // Equip handlers
    this.container.querySelectorAll('.bento-med-card').forEach((card) => {
      card.addEventListener('click', () => {
        const medId = card.getAttribute('data-med') as MedicineType;
        if (medId && this.save.unlockedMedicines.includes(medId)) {
          equipMedicine(this.save, medId);
          this.onEquip(medId);
          this.render(); // re-render state
        }
      });
    });
  }

  public close(): void {
    this.container.remove();
    this.onClose();
  }
}
