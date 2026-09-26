/**
 * Biology Dash: Immune Patrol
 * Save System (Schema v4), Local Storage Persistence & Migrations
 */

import { GameSaveSchema, MedicineType } from '../core/types';

export const SAVE_KEY = 'biology_dash_save_v4';

export const DEFAULT_SAVE: GameSaveSchema = {
  version: 4,
  coins: 0,
  patrolsCompleted: [1],
  patrolStars: { 1: 0 },
  upgrades: {
    speed: 1,
    reach: 1,
    initialSquad: 1,
    cytokineRate: 1,
  },
  unlockedMedicines: ['amoxicillin', 'doxycycline'],
  equippedMedicine: 'amoxicillin',
  selectedRoster: ['neutrophil', 'macrophage', 'plasma'],
  audioVolume: 0.8,
  musicVolume: 0.8,
};

export function loadSave(): GameSaveSchema {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_SAVE };
    }

    // Auto-migrate schema v1..v3 to v4
    const save: GameSaveSchema = {
      version: 4,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      patrolsCompleted: Array.isArray(parsed.patrolsCompleted) ? parsed.patrolsCompleted : [1],
      patrolStars: parsed.patrolStars || { 1: 0 },
      upgrades: {
        speed: parsed.upgrades?.speed || 1,
        reach: parsed.upgrades?.reach || 1,
        initialSquad: parsed.upgrades?.initialSquad || 1,
        cytokineRate: parsed.upgrades?.cytokineRate || 1,
      },
      unlockedMedicines: Array.isArray(parsed.unlockedMedicines)
        ? parsed.unlockedMedicines
        : ['amoxicillin', 'doxycycline'],
      equippedMedicine: parsed.equippedMedicine || 'amoxicillin',
      selectedRoster: Array.isArray(parsed.selectedRoster)
        ? parsed.selectedRoster
        : ['neutrophil', 'macrophage', 'plasma'],
      audioVolume: typeof parsed.audioVolume === 'number' ? parsed.audioVolume : 0.8,
      musicVolume: typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.8,
    };

    return save;
  } catch (_e) {
    return { ...DEFAULT_SAVE };
  }
}

export function saveGame(save: GameSaveSchema): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (_e) {
    // Local storage quota fallback
  }
}

export function getUpgradeCost(level: number): number {
  return Math.floor(40 * Math.pow(1.65, level - 1));
}

export function purchaseUpgrade(
  save: GameSaveSchema,
  category: keyof GameSaveSchema['upgrades']
): boolean {
  const currentLvl = save.upgrades[category];
  if (currentLvl >= 10) return false;

  const cost = getUpgradeCost(currentLvl);
  if (save.coins < cost) return false;

  save.coins -= cost;
  save.upgrades[category]++;
  saveGame(save);
  return true;
}

export function recordPatrolVictory(
  save: GameSaveSchema,
  patrolId: number,
  stars: number,
  coinsEarned: number
): void {
  save.coins += coinsEarned;
  if (!save.patrolsCompleted.includes(patrolId)) {
    save.patrolsCompleted.push(patrolId);
  }
  // Unlock next patrol
  if (patrolId < 10 && !save.patrolsCompleted.includes(patrolId + 1)) {
    save.patrolsCompleted.push(patrolId + 1);
  }
  const prevStars = save.patrolStars[patrolId] || 0;
  save.patrolStars[patrolId] = Math.max(prevStars, stars);

  // Milestone medicine unlocks
  if (patrolId >= 4 && !save.unlockedMedicines.includes('cefepime')) {
    save.unlockedMedicines.push('cefepime');
  }
  if (patrolId >= 6 && !save.unlockedMedicines.includes('micafungin')) {
    save.unlockedMedicines.push('micafungin');
  }

  saveGame(save);
}

export function equipMedicine(save: GameSaveSchema, med: MedicineType): void {
  if (save.unlockedMedicines.includes(med)) {
    save.equippedMedicine = med;
    saveGame(save);
  }
}
