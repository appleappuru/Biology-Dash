/**
 * Biology Dash: Immune Patrol
 * 10 Authored Clinical Patrols & Wave Scripts
 */

import { PatrolConfig } from './types';

export const AUTHORED_PATROLS: PatrolConfig[] = [
  {
    id: 1,
    name: 'Patrol 1: First Hug',
    subtitle: 'The Capillary Breach (Tutorial)',
    duration: 32,
    startCells: 6,
    targetSpecies: ['s_aureus'],
    waves: [
      { timeOffset: 3, species: 's_aureus', count: 4, lanePattern: 'cluster', spreadX: 60, baseY: -20 },
      { timeOffset: 9, species: 's_aureus', count: 8, lanePattern: 'line', spreadX: 120, baseY: -20 },
      { timeOffset: 16, species: 's_aureus', count: 12, lanePattern: 'cluster', spreadX: 140, baseY: -20 },
    ],
    gateSpawns: [
      {
        y: -150,
        pairs: [
          { id: 'p1_g1', x: 130, y: -150, width: 140, height: 44, op: 'add', value: 8, label: '+8 Cells', sublabel: 'Neutrophils' },
          { id: 'p1_g2', x: 290, y: -150, width: 140, height: 44, op: 'multiply', value: 2, label: '×2 Swarm', sublabel: 'Chemokines' },
        ],
      },
      {
        y: -450,
        pairs: [
          { id: 'p1_g3', x: 210, y: -450, width: 160, height: 44, op: 'multiply', value: 3, label: '×3 Cascade', sublabel: 'Extravasation' },
        ],
      },
    ],
    biofilms: [
      { id: 'p1_b1', x: 210, y: -300, width: 90, height: 38, hp: 12, maxHp: 12, rewardType: 'coins', rewardValue: 25 },
    ],
    bossHp: 80,
    bossName: 'Staph Biofilm Core',
    bossSpecies: 's_aureus',
    briefing: {
      title: 'First Contact: Minor Abrasion',
      clinicalContext: 'A tiny skin graze allows commensal Staphylococcus aureus to cross the stratum corneum.',
      targetOrganism: 'Staphylococcus aureus (Gram-positive cocci)',
      recommendedDrug: 'amoxicillin',
      tip: 'Hold the Medicine button to charge Amoxicillin and crack bacterial cell walls!',
    },
  },
  {
    id: 2,
    name: 'Patrol 2: Giant Hugger',
    subtitle: 'Macrophage Infiltration',
    duration: 90,
    startCells: 10,
    targetSpecies: ['s_aureus'],
    waves: [
      { timeOffset: 4, species: 's_aureus', count: 12, lanePattern: 'line', spreadX: 160, baseY: -30 },
      { timeOffset: 18, species: 's_aureus', count: 18, lanePattern: 'cluster', spreadX: 200, baseY: -30 },
      { timeOffset: 36, species: 's_aureus', count: 24, lanePattern: 'cluster', spreadX: 220, baseY: -30 },
      { timeOffset: 55, species: 's_aureus', count: 30, lanePattern: 'line', spreadX: 240, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -200,
        pairs: [
          { id: 'p2_g1', x: 140, y: -200, width: 130, height: 44, op: 'add', value: 15, label: '+15 Cells', sublabel: 'Recruits' },
          { id: 'p2_g2', x: 280, y: -200, width: 130, height: 44, op: 'multiply', value: 2, label: '×2 Chemokines', sublabel: 'Cascade' },
        ],
      },
    ],
    biofilms: [
      { id: 'p2_b1', x: 210, y: -400, width: 100, height: 40, hp: 20, maxHp: 20, rewardType: 'macrophage', rewardValue: 1 },
    ],
    bossHp: 180,
    bossName: 'Staph Macro-Cluster',
    bossSpecies: 's_aureus',
    briefing: {
      title: 'Deep Dermal Infiltration',
      clinicalContext: 'Resident tissue macrophages coordinate phagocytosis and engulf large clumps.',
      targetOrganism: 'Staphylococcus aureus',
      recommendedDrug: 'amoxicillin',
      tip: 'Free the trapped Macrophage buddy from the biofilm barrier to double your reach!',
    },
  },
  {
    id: 3,
    name: 'Patrol 3: Clinical Dilemma',
    subtitle: 'The Spectrum Test',
    duration: 90,
    startCells: 12,
    targetSpecies: ['s_aureus', 'pneumococcus'],
    waves: [
      { timeOffset: 5, species: 'pneumococcus', count: 10, lanePattern: 'cluster', spreadX: 150, baseY: -30 },
      { timeOffset: 25, species: 's_aureus', count: 20, lanePattern: 'line', spreadX: 200, baseY: -30 },
      { timeOffset: 50, species: 'pneumococcus', count: 25, lanePattern: 'cluster', spreadX: 240, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -250,
        pairs: [
          { id: 'p3_g1', x: 130, y: -250, width: 130, height: 44, op: 'multiply', value: 2.5, label: '×2.5 Rush', sublabel: 'Neutrophils' },
          { id: 'p3_g2', x: 290, y: -250, width: 130, height: 44, op: 'add', value: 25, label: '+25 Squad', sublabel: 'Reinforce' },
        ],
      },
    ],
    biofilms: [],
    bossHp: 220,
    bossName: 'Pneumo-Staph Coalition',
    bossSpecies: 'pneumococcus',
    briefing: {
      title: 'Pneumococcal Respiratory Challenge',
      clinicalContext: 'Encapsulated Streptococcus pneumoniae pairs create protective sugary shields.',
      targetOrganism: 'S. pneumoniae & S. aureus',
      recommendedDrug: 'amoxicillin',
      tip: 'Both species have peptidoglycan walls susceptible to Amoxicillin beta-lactams.',
    },
  },
  {
    id: 4,
    name: 'Patrol 4: The Resistance Pivot',
    subtitle: 'Beta-Lactamase Evasion',
    duration: 90,
    startCells: 15,
    targetSpecies: ['beta_lactamase_sa', 's_aureus'],
    waves: [
      { timeOffset: 4, species: 'beta_lactamase_sa', count: 14, lanePattern: 'line', spreadX: 180, baseY: -30 },
      { timeOffset: 30, species: 'beta_lactamase_sa', count: 22, lanePattern: 'cluster', spreadX: 220, baseY: -30 },
      { timeOffset: 55, species: 'beta_lactamase_sa', count: 30, lanePattern: 'cluster', spreadX: 250, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -300,
        pairs: [
          { id: 'p4_g1', x: 140, y: -300, width: 130, height: 44, op: 'multiply', value: 2, label: '×2 Swarm', sublabel: 'Cascade' },
          { id: 'p4_g2', x: 280, y: -300, width: 130, height: 44, op: 'add', value: 20, label: '+20 Cells', sublabel: 'Extravasation' },
        ],
      },
    ],
    biofilms: [
      { id: 'p4_b1', x: 210, y: -500, width: 110, height: 42, hp: 25, maxHp: 25, rewardType: 'coins', rewardValue: 40 },
    ],
    bossHp: 260,
    bossName: 'Beta-Lactamase Fortress',
    bossSpecies: 'beta_lactamase_sa',
    briefing: {
      title: 'Enzymatic Drug Destruction',
      clinicalContext: 'Pathogens produce beta-lactamase enzyme to cut Amoxicillin rings! Switch to Doxycycline.',
      targetOrganism: 'Beta-Lactamase+ S. aureus',
      recommendedDrug: 'doxycycline',
      tip: 'Doxycycline inhibits 30S ribosomal protein synthesis, freezing bacteria for 6s!',
    },
  },
  {
    id: 5,
    name: 'Patrol 5: Antibody Fairies',
    subtitle: 'The Plasma Queen & Colony Crown',
    duration: 90,
    startCells: 15,
    targetSpecies: ['s_aureus', 'e_coli'],
    waves: [
      { timeOffset: 5, species: 'e_coli', count: 15, lanePattern: 'cluster', spreadX: 180, baseY: -30 },
      { timeOffset: 28, species: 's_aureus', count: 25, lanePattern: 'line', spreadX: 230, baseY: -30 },
      { timeOffset: 52, species: 'e_coli', count: 32, lanePattern: 'cluster', spreadX: 260, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -250,
        pairs: [
          { id: 'p5_g1', x: 130, y: -250, width: 130, height: 44, op: 'multiply', value: 3, label: '×3 Cascade', sublabel: 'IgG Priming' },
          { id: 'p5_g2', x: 290, y: -250, width: 130, height: 44, op: 'add', value: 30, label: '+30 Swarm', sublabel: 'Army' },
        ],
      },
    ],
    biofilms: [],
    bossHp: 300,
    bossName: 'Colony Crown',
    bossSpecies: 's_aureus',
    briefing: {
      title: 'Humoral Immunity Activation',
      clinicalContext: 'Plasma B-cells fire millions of Y-shaped IgG antibodies that tag microbes for 2x engulfment.',
      targetOrganism: 'Mixed Gram-positive & Gram-negative',
      recommendedDrug: 'doxycycline',
      tip: 'Trigger Cytokine Surge to summon the Plasma Fairy Queen for screen-wide antibody fireworks!',
    },
  },
  {
    id: 6,
    name: 'Patrol 6: Epitope Shift',
    subtitle: 'Antigenic Variation',
    duration: 90,
    startCells: 18,
    targetSpecies: ['antigen_b_sa', 's_aureus'],
    waves: [
      { timeOffset: 5, species: 'antigen_b_sa', count: 18, lanePattern: 'cluster', spreadX: 200, baseY: -30 },
      { timeOffset: 32, species: 'antigen_b_sa', count: 26, lanePattern: 'line', spreadX: 240, baseY: -30 },
      { timeOffset: 58, species: 'antigen_b_sa', count: 35, lanePattern: 'cluster', spreadX: 280, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -300,
        pairs: [
          { id: 'p6_g1', x: 140, y: -300, width: 130, height: 44, op: 'multiply', value: 2.5, label: '×2.5 Rush', sublabel: 'Affinity' },
          { id: 'p6_g2', x: 280, y: -300, width: 130, height: 44, op: 'add', value: 25, label: '+25 Clones', sublabel: 'B-Cells' },
        ],
      },
    ],
    biofilms: [],
    bossHp: 320,
    bossName: 'Antigen-B Sovereign',
    bossSpecies: 'antigen_b_sa',
    briefing: {
      title: 'Epitope Escape Mechanism',
      clinicalContext: 'Microbes mutate surface proteins into Epitope B (crown epitope). Phagocytes adapt through affinity selection.',
      targetOrganism: 'Antigen-B S. aureus',
      recommendedDrug: 'doxycycline',
      tip: 'Antibodies must match epitope shapes to effectively opsonize targets.',
    },
  },
  {
    id: 7,
    name: 'Patrol 7: Yeast Invasion',
    subtitle: 'Candida albicans & Micafungin',
    duration: 90,
    startCells: 20,
    targetSpecies: ['candida', 's_aureus'],
    waves: [
      { timeOffset: 6, species: 'candida', count: 16, lanePattern: 'cluster', spreadX: 200, baseY: -30 },
      { timeOffset: 30, species: 'candida', count: 24, lanePattern: 'cluster', spreadX: 240, baseY: -30 },
      { timeOffset: 55, species: 'candida', count: 32, lanePattern: 'cluster', spreadX: 260, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -280,
        pairs: [
          { id: 'p7_g1', x: 130, y: -280, width: 130, height: 44, op: 'multiply', value: 2, label: '×2 Cascade', sublabel: 'Antifungal' },
          { id: 'p7_g2', x: 290, y: -280, width: 130, height: 44, op: 'add', value: 25, label: '+25 Phagocytes', sublabel: 'Neutrophils' },
        ],
      },
    ],
    biofilms: [
      { id: 'p7_b1', x: 210, y: -450, width: 110, height: 42, hp: 28, maxHp: 28, rewardType: 'coins', rewardValue: 50 },
    ],
    bossHp: 350,
    bossName: 'Candida Biofilm Hive',
    bossSpecies: 'candida',
    briefing: {
      title: 'Opportunistic Fungal Overgrowth',
      clinicalContext: 'Candida is a diploid fungus with beta-glucan cell walls. Antibiotics are 100% INEFFECTIVE!',
      targetOrganism: 'Candida albicans (Yeast)',
      recommendedDrug: 'micafungin',
      tip: 'Equip Micafungin in your Care Kit! It halts 1,3-beta-D-glucan synthase to shatter fungi.',
    },
  },
  {
    id: 8,
    name: 'Patrol 8: Immune Recall',
    subtitle: 'Secondary Memory Cascade',
    duration: 90,
    startCells: 22,
    targetSpecies: ['s_aureus', 'pneumococcus', 'e_coli'],
    waves: [
      { timeOffset: 5, species: 'pneumococcus', count: 20, lanePattern: 'line', spreadX: 220, baseY: -30 },
      { timeOffset: 28, species: 'e_coli', count: 28, lanePattern: 'cluster', spreadX: 250, baseY: -30 },
      { timeOffset: 52, species: 's_aureus', count: 36, lanePattern: 'cluster', spreadX: 270, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -300,
        pairs: [
          { id: 'p8_g1', x: 130, y: -300, width: 130, height: 44, op: 'multiply', value: 3, label: '×3 Memory', sublabel: 'Rapid Recall' },
          { id: 'p8_g2', x: 290, y: -300, width: 130, height: 44, op: 'add', value: 35, label: '+35 Veterans', sublabel: 'Swarm' },
        ],
      },
    ],
    biofilms: [],
    bossHp: 380,
    bossName: 'Polymicrobial Nexus',
    bossSpecies: 's_aureus',
    briefing: {
      title: 'Secondary Immune Response',
      clinicalContext: 'Memory B and T cells respond 10x faster with higher antibody affinity.',
      targetOrganism: 'Mixed Bacterial Influx',
      recommendedDrug: 'amoxicillin',
      tip: 'Your cytokine meter charges much faster during secondary recall encounters.',
    },
  },
  {
    id: 9,
    name: 'Patrol 9: Blue Pus Menace',
    subtitle: 'Pseudomonas & Cefepime',
    duration: 90,
    startCells: 24,
    targetSpecies: ['pseudomonas', 'e_coli'],
    waves: [
      { timeOffset: 5, species: 'pseudomonas', count: 22, lanePattern: 'zigzag', spreadX: 240, baseY: -30 },
      { timeOffset: 28, species: 'pseudomonas', count: 30, lanePattern: 'zigzag', spreadX: 270, baseY: -30 },
      { timeOffset: 52, species: 'pseudomonas', count: 40, lanePattern: 'zigzag', spreadX: 300, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -300,
        pairs: [
          { id: 'p9_g1', x: 140, y: -300, width: 130, height: 44, op: 'multiply', value: 2.5, label: '×2.5 Rush', sublabel: 'Defensins' },
          { id: 'p9_g2', x: 280, y: -300, width: 130, height: 44, op: 'add', value: 30, label: '+30 Swarm', sublabel: 'Patrol' },
        ],
      },
    ],
    biofilms: [
      { id: 'p9_b1', x: 210, y: -450, width: 110, height: 42, hp: 30, maxHp: 30, rewardType: 'coins', rewardValue: 60 },
    ],
    bossHp: 420,
    bossName: 'Pseudomonas Slime Nest',
    bossSpecies: 'pseudomonas',
    briefing: {
      title: 'Nosocomial Flagellar Blitz',
      clinicalContext: 'Pseudomonas is a fast, motile Gram-negative rod with active efflux pumps. Standard penicillins fail.',
      targetOrganism: 'Pseudomonas aeruginosa',
      recommendedDrug: 'cefepime',
      tip: 'Equip Cefepime (4th-gen cephalosporin) to penetrate outer membranes and bind PBP3!',
    },
  },
  {
    id: 10,
    name: 'Patrol 10: Mosaic Monarch',
    subtitle: 'The Capstone Multi-Resistant Hive',
    duration: 90,
    startCells: 25,
    targetSpecies: ['mrsa', 'pseudomonas', 'candida'],
    waves: [
      { timeOffset: 5, species: 'mrsa', count: 24, lanePattern: 'line', spreadX: 250, baseY: -30 },
      { timeOffset: 25, species: 'pseudomonas', count: 32, lanePattern: 'zigzag', spreadX: 280, baseY: -30 },
      { timeOffset: 48, species: 'candida', count: 36, lanePattern: 'cluster', spreadX: 300, baseY: -30 },
      { timeOffset: 65, species: 'mrsa', count: 42, lanePattern: 'cluster', spreadX: 320, baseY: -30 },
    ],
    gateSpawns: [
      {
        y: -300,
        pairs: [
          { id: 'p10_g1', x: 130, y: -300, width: 130, height: 44, op: 'multiply', value: 3, label: '×3 Swarm', sublabel: 'Full Mobilize' },
          { id: 'p10_g2', x: 290, y: -300, width: 130, height: 44, op: 'add', value: 40, label: '+40 Titan Herd', sublabel: 'Defenders' },
        ],
      },
    ],
    biofilms: [
      { id: 'p10_b1', x: 150, y: -450, width: 90, height: 40, hp: 30, maxHp: 30, rewardType: 'macrophage', rewardValue: 1 },
      { id: 'p10_b2', x: 270, y: -450, width: 90, height: 40, hp: 30, maxHp: 30, rewardType: 'coins', rewardValue: 80 },
    ],
    bossHp: 500,
    bossName: 'Mosaic Monarch Core',
    bossSpecies: 'mrsa',
    briefing: {
      title: 'Multidrug-Resistant Biofilm Apex',
      clinicalContext: 'The supreme test of immunological coordination: MRSA (PBP2a), Pseudomonas, and fungal Candida.',
      targetOrganism: 'Super-Colony Mosaic',
      recommendedDrug: 'cefepime',
      tip: 'Coordinate medicine pulses with Titan Macrophage cytokine surges to break the colony!',
    },
  },
];
