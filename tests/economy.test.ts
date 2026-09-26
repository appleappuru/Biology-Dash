import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSave,
  getUpgradeCost,
  purchaseUpgrade,
  recordPatrolVictory,
  equipMedicine,
  SAVE_KEY,
} from '../src/storage/save';

const storageMock: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => storageMock[k] ?? null,
  setItem: (k: string, v: string) => { storageMock[k] = v; },
  clear: () => { Object.keys(storageMock).forEach((k) => delete storageMock[k]); },
};

(globalThis as any).localStorage = mockLocalStorage;

describe('Save System & Economy Upgrades', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('loads default save schema v4 when local storage is empty', () => {
    const save = loadSave();
    expect(save.version).toBe(4);
    expect(save.coins).toBe(0);
    expect(save.patrolsCompleted).toEqual([1]);
    expect(save.unlockedMedicines).toContain('amoxicillin');
  });

  it('calculates escalating upgrade costs correctly', () => {
    const costLvl1 = getUpgradeCost(1);
    const costLvl2 = getUpgradeCost(2);
    const costLvl3 = getUpgradeCost(3);

    expect(costLvl1).toBe(40);
    expect(costLvl2).toBeGreaterThan(costLvl1);
    expect(costLvl3).toBeGreaterThan(costLvl2);
  });

  it('purchases upgrades only when player has sufficient coins', () => {
    const save = loadSave();
    save.coins = 30; // insufficient for 40 cost
    const failed = purchaseUpgrade(save, 'speed');
    expect(failed).toBe(false);
    expect(save.upgrades.speed).toBe(1);

    save.coins = 100;
    const success = purchaseUpgrade(save, 'speed');
    expect(success).toBe(true);
    expect(save.upgrades.speed).toBe(2);
    expect(save.coins).toBe(60);
  });

  it('records patrol victory, awards stars and unlocks next patrol', () => {
    const save = loadSave();
    recordPatrolVictory(save, 1, 3, 50);

    expect(save.coins).toBe(50);
    expect(save.patrolStars[1]).toBe(3);
    expect(save.patrolsCompleted).toContain(2); // unlocked patrol 2
  });

  it('equips unlocked medicine successfully', () => {
    const save = loadSave();
    equipMedicine(save, 'doxycycline');
    expect(save.equippedMedicine).toBe('doxycycline');
  });

  it('handles corrupted localStorage gracefully without crashing', () => {
    localStorage.setItem(SAVE_KEY, '{invalid_json}');
    const save = loadSave();
    expect(save.version).toBe(4);
    expect(save.coins).toBe(0);
  });
});
