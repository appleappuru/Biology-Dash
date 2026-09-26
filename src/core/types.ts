/**
 * Biology Dash: Immune Patrol
 * Core Type Definitions & Domain Models
 */

export type DefenderType = 'neutrophil' | 'macrophage' | 'plasma';

export type MicrobeSpecies =
  | 's_aureus'
  | 'beta_lactamase_sa'
  | 'doxy_resistant_sa'
  | 'mrsa'
  | 'antigen_b_sa'
  | 'pneumococcus'
  | 'e_coli'
  | 'pseudomonas'
  | 'candida';

export type MedicineType =
  | 'amoxicillin'
  | 'doxycycline'
  | 'cefepime'
  | 'micafungin';

export type GateOp = 'multiply' | 'add' | 'divide' | 'subtract' | 'turret' | 'shield' | 'antibody';

export interface GateItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  op: GateOp;
  value: number;
  label: string;
  sublabel: string;
  isOscillating?: boolean;
  oscSpeed?: number;
  oscAmplitude?: number;
  oscBaseX?: number;
  triggered?: boolean;
}

export interface BiofilmObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  rewardType: 'coins' | 'macrophage' | 'medicine_refill';
  rewardValue: number;
  cracked?: boolean;
}

export interface CellUnit {
  id: number;
  type: DefenderType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetOffset: { x: number; y: number };
  scale: number;
  squashX: number;
  squashY: number;
  banking: number; // -1 to 1 for tilt
  state: 'marching' | 'engulfing' | 'digesting';
  digestionTimer: number;
}

export interface MicrobeUnit {
  id: number;
  species: MicrobeSpecies;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  width: number;
  height: number;
  opsonized: boolean;
  frozenTimer: number;
  dizzyTimer: number;
  isBoss?: boolean;
  bossSegment?: number;
}

export interface ChampionUnit {
  id: number;
  type: 'titan' | 'plasma_queen';
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  active: boolean;
  lifeTimer: number;
  absorbedCount: number;
}

export interface SimulationEvent {
  type:
    | 'gate_hit'
    | 'cell_spawned'
    | 'cell_lost'
    | 'microbe_engulfed'
    | 'microbe_shattered'
    | 'biofilm_hit'
    | 'biofilm_burst'
    | 'champion_spawned'
    | 'medicine_fired'
    | 'colony_hit'
    | 'colony_burst'
    | 'combo_tick';
  data?: any;
}

export interface SimulationState {
  tick: number;
  timeSeconds: number;
  patrolDuration: number;
  squadCenter: { x: number; y: number };
  cells: CellUnit[];
  microbes: MicrobeUnit[];
  gates: GateItem[];
  biofilms: BiofilmObstacle[];
  champions: ChampionUnit[];
  frontlineY: number;
  breachLineY: number;
  pushbackOffset: number;
  cytokineMeter: number;
  cytokineMax: number;
  isSurgeReady: boolean;
  bulletTimeActive: boolean;
  bulletTimeScale: number;
  score: number;
  coinsEarned: number;
  comboCount: number;
  comboTimer: number;
  status: 'playing' | 'victory' | 'defeat' | 'paused';
  colonyBoss: MicrobeUnit | null;
  events: SimulationEvent[];
}

export interface PatrolWave {
  timeOffset: number;
  species: MicrobeSpecies;
  count: number;
  lanePattern: 'cluster' | 'line' | 'zigzag' | 'pincer';
  spreadX: number;
  baseY: number;
}

export interface PatrolGateSpawn {
  y: number;
  pairs: GateItem[];
}

export interface PatrolConfig {
  id: number;
  name: string;
  subtitle: string;
  duration: number; // seconds (32 for tutorial, 90 for others)
  startCells: number;
  targetSpecies: MicrobeSpecies[];
  waves: PatrolWave[];
  gateSpawns: PatrolGateSpawn[];
  biofilms: BiofilmObstacle[];
  bossHp: number;
  bossName: string;
  bossSpecies: MicrobeSpecies;
  briefing: {
    title: string;
    clinicalContext: string;
    targetOrganism: string;
    recommendedDrug: MedicineType;
    tip: string;
  };
}

export interface SquadUpgradeLevels {
  speed: number;
  reach: number;
  initialSquad: number;
  cytokineRate: number;
}

export interface GameSaveSchema {
  version: number;
  coins: number;
  patrolsCompleted: number[];
  patrolStars: Record<number, number>;
  upgrades: SquadUpgradeLevels;
  unlockedMedicines: MedicineType[];
  equippedMedicine: MedicineType;
  selectedRoster: DefenderType[];
  audioVolume: number;
  musicVolume: number;
}
