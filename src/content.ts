/** Evidence-backed compatibility is separate from deliberately abstract balance values. */
export type DefenderId = 'neutrophil' | 'macrophage' | 'plasma';
export type MedicineId = 'amoxicillin' | 'doxycycline' | 'cefepime' | 'micafungin';
export type PathogenId = 'susceptible' | 'beta-lactamase' | 'doxy-resistant' | 'dual-resistant' | 'antigen-b' | 'pneumococcus' | 'e-coli' | 'pseudomonas' | 'candida';
export type Epitope = 'A' | 'B';
export interface AntibodyProfile {
    epitope: Epitope;
    affinity: number;
    effector: 'opsonization';
}
export interface Defender {
    id: DefenderId;
    name: string;
    role: string;
    feedback: string;
    unlockLevel: number;
}
export interface Medicine {
    id: MedicineId;
    name: string;
    effect: 'kill' | 'inhibit';
    unlockLevel: number;
    target: 'bacterium' | 'fungus';
    mechanism: string;
    limitation: string;
}
export interface Pathogen {
    id: PathogenId;
    name: string;
    species: string;
    kind: 'bacterium' | 'fungus';
    shortName: string;
    morphology: string;
    habitat: string;
    defense: string;
    capsule?: boolean;
    art: { texture: string; row: number };
    context: 'extracellular';
    epitope: Epitope;
    susceptibility: Record<MedicineId, 'susceptible' | 'resistant' | 'not-targeted'>;
    clue: string;
    hp: number;
    speed: number;
    color: number;
}
export interface Level {
    id: number;
    name: string;
    subtitle: string;
    duration: number;
    objective: string;
    decision: string;
    feedback: string;
    transfer: string;
    pathogens: PathogenId[];
    boss?: 'colony-crown' | 'shield-colony';
    unlock?: DefenderId;
    learningCheck: 'steer' | 'recruit' | 'medicine' | 'susceptibility' | 'cooperation' | 'antigen' | 'affinity' | 'recall' | 'integration';
}
export const DEFENDERS: Defender[] = [
    { id: 'neutrophil', name: 'Neutrophil', role: 'Rapid phagocyte', feedback: 'Engulf bacteria at close range. Neutrophils do not make antibodies.', unlockLevel: 1 },
    { id: 'macrophage', name: 'Macrophage', role: 'Steady phagocyte', feedback: 'Macrophages engulf bacteria too; both phagocytes can use opsonin tags.', unlockLevel: 2 },
    { id: 'plasma', name: 'Plasma cell', role: 'Antibody support', feedback: 'Secretes matching antibodies that tag bacteria for phagocytes. Binding alone does not kill.', unlockLevel: 5 },
];
export const MEDICINES: Medicine[] = [
    { id: 'amoxicillin', name: 'Amoxicillin', unlockLevel: 3, target: 'bacterium', effect: 'kill', mechanism: 'Disrupts cell-wall synthesis in susceptible, multiplying bacteria.', limitation: 'This encounter assumes a tested susceptible, beta-lactamase-negative isolate. No antibacterial activity against viruses.' },
    { id: 'doxycycline', name: 'Doxycycline', unlockLevel: 3, target: 'bacterium', effect: 'inhibit', mechanism: 'Inhibits bacterial protein synthesis at the 30S ribosome; slows growth.', limitation: 'Requires isolate susceptibility. Growth inhibition is not immediate killing or a guaranteed clinical outcome.' },
    { id: 'cefepime', name: 'Cefepime', unlockLevel: 9, target: 'bacterium', effect: 'kill', mechanism: 'Cephalosporin antibiotic: disrupts bacterial cell-wall synthesis.', limitation: 'Only tested susceptible isolates respond. Not a treatment for MRSA or fungi.' },
    { id: 'micafungin', name: 'Micafungin', unlockLevel: 7, target: 'fungus', effect: 'kill', mechanism: 'Echinocandin antifungal: inhibits fungal beta-glucan cell-wall synthesis.', limitation: 'Targets susceptible Candida. Does not treat bacteria; real treatment depends on infection site and clinical assessment.' },
];
export const PATHOGENS: Pathogen[] = [
    { id: 'susceptible', shortName: 'S. aureus', morphology: 'Grape-like clusters of round cocci', habitat: 'Skin and wound infections', defense: 'Close phagocyte contact and matching antibody tags.', art: { texture: 'enemies-v2', row: 0 }, name: 'Tested susceptible', species: 'Staphylococcus aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'susceptible', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Lab: amoxicillin and doxycycline susceptible; beta-lactamase negative, methicillin susceptible.', hp: 22, speed: 48, color: 0x86bd61 },
    { id: 'beta-lactamase', shortName: 'S. aureus', morphology: 'Grape-like clusters of round cocci', habitat: 'Skin and wound infections', defense: 'Close phagocyte contact and matching antibody tags.', art: { texture: 'enemies-v2', row: 1 }, name: 'Beta-lactamase +', species: 'Staphylococcus aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'resistant', doxycycline: 'susceptible', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Lab: amoxicillin resistant; doxycycline susceptible. Beta-lactamase breaks down amoxicillin.', hp: 27, speed: 51, color: 0xd2a75b },
    { id: 'doxy-resistant', shortName: 'S. aureus', morphology: 'Grape-like clusters of round cocci', habitat: 'Skin and wound infections', defense: 'Close phagocyte contact and matching antibody tags.', art: { texture: 'enemies-v2', row: 2 }, name: 'Doxycycline R', species: 'Staphylococcus aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'resistant', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Lab: doxycycline resistant; amoxicillin susceptible, beta-lactamase negative, methicillin susceptible.', hp: 25, speed: 62, color: 0xda899d },
    { id: 'dual-resistant', shortName: 'MRSA', morphology: 'Grape-like clusters of round cocci', habitat: 'Skin and wound infections', defense: 'Close phagocyte contact and matching antibody tags.', art: { texture: 'enemies-v2', row: 3 }, name: 'MRSA · multidrug resistant', species: 'Staphylococcus aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'resistant', doxycycline: 'resistant', cefepime: 'resistant', micafungin: 'not-targeted' }, clue: 'Lab: methicillin, amoxicillin, doxycycline and cefepime resistant. Phagocyte/antibody cooperation still helps in this simplified encounter.', hp: 32, speed: 42, color: 0x9d8bc2 },
    { id: 'antigen-b', shortName: 'S. aureus', morphology: 'Grape-like clusters of round cocci', habitat: 'Skin and wound infections', defense: 'Close phagocyte contact and matching antibody tags.', art: { texture: 'enemies-v2', row: 4 }, name: 'Different epitope B', species: 'Staphylococcus aureus', kind: 'bacterium', context: 'extracellular', epitope: 'B', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'susceptible', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Surface epitope B, not A. Lab: amoxicillin and doxycycline susceptible; beta-lactamase negative, methicillin susceptible.', hp: 24, speed: 56, color: 0x55bfc1 },
    { id: 'pneumococcus', name: 'Pneumococcus · encapsulated', shortName: 'Pneumococcus', species: 'Streptococcus pneumoniae', kind: 'bacterium', context: 'extracellular', morphology: 'Paired, pointed cocci inside a capsule', habitat: 'Respiratory and ear infections; invasive disease', defense: 'Capsule impedes uptake. Matching antibodies or complement opsonins restore efficient engulfment.', capsule: true, art: { texture: 'microbes-v3', row: 0 }, epitope: 'B', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'resistant', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Fictional non-meningeal isolate: amoxicillin S, doxycycline R, cefepime S. Capsule makes untagged engulfment harder.', hp: 28, speed: 43, color: 0xa8a4ec },
    { id: 'e-coli', name: 'E. coli · tested isolate', shortName: 'E. coli', species: 'Escherichia coli', kind: 'bacterium', context: 'extracellular', morphology: 'Short rods with fine pili and flagella', habitat: 'Urinary tract infections; many strains normally live in the gut', defense: 'Intercept mobile rods with phagocytes. Read the isolate report before using support.', art: { texture: 'microbes-v3', row: 1 }, epitope: 'A', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'resistant', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Fictional tested isolate: amoxicillin S, doxycycline R, cefepime S. This is not a species-wide recommendation.', hp: 23, speed: 57, color: 0xf4a6a0 },
    { id: 'pseudomonas', name: 'Pseudomonas · resistant to early options', shortName: 'Pseudomonas', species: 'Pseudomonas aeruginosa', kind: 'bacterium', context: 'extracellular', morphology: 'Slender rods with a polar flagellum', habitat: 'Healthcare-associated lung, wound and urinary infections', defense: 'Keep phagocytes in range. This isolate needs a different antibiotic option: tested-susceptible cefepime.', art: { texture: 'microbes-v3', row: 2 }, epitope: 'B', susceptibility: { amoxicillin: 'resistant', doxycycline: 'resistant', cefepime: 'susceptible', micafungin: 'not-targeted' }, clue: 'Lab: amoxicillin R, doxycycline R, cefepime S. Other Pseudomonas isolates can also resist cefepime.', hp: 34, speed: 52, color: 0x55c4b6 },
    { id: 'candida', name: 'Candida · budding yeast', shortName: 'C. albicans', species: 'Candida albicans', kind: 'fungus', context: 'extracellular', morphology: 'Oval budding yeast; can form germ tubes and hyphae', habitat: 'Thrush and invasive candidiasis; can also be a normal colonizer', defense: 'Neutrophils are important antifungal defenders. Use micafungin for this tested-susceptible isolate; antibacterial drugs have no fungal target.', art: { texture: 'microbes-v3', row: 3 }, epitope: 'B', susceptibility: { amoxicillin: 'not-targeted', doxycycline: 'not-targeted', cefepime: 'not-targeted', micafungin: 'susceptible' }, clue: 'Fungal isolate: micafungin S. Antibacterial drugs are not targeted to Candida; this is not acquired antibiotic resistance.', hp: 37, speed: 39, color: 0xf3d4ac },

];
export const BOSSES = [
    { id: 'colony-crown', name: 'Colony Crown', pathogenId: 'susceptible' as PathogenId, description: 'A theatrical enlarged susceptible colony. Each wrap removes a fragment; size does not cause resistance.' },
    { id: 'shield-colony', name: 'Mosaic Monarch', pathogenId: 'dual-resistant' as PathogenId, description: 'A theatrical colony with explicitly tested antibiotic resistance. Its size is unrelated to resistance.' },
] as const;
export const LEVELS: Level[] = [
    { id: 1, name: 'First response', subtitle: 'Learn the patrol', duration: 90, objective: 'Steer phagocytes into close contact with bacteria.', decision: 'Intercept an approaching cluster and collect arriving cells.', feedback: 'Close-range engulfment clears bacteria. Cells crossing the tissue line cost one defender: breach rescue.', transfer: 'Level 2 introduces a new cluster lane without the steering hint.', pathogens: ['susceptible'], learningCheck: 'steer' },
    { id: 2, name: 'Better together', subtitle: 'E. coli joins the trail', duration: 90, objective: 'Recognize overlapping phagocyte roles.', decision: 'Choose recruitment or wider contact coverage.', feedback: 'Macrophages and neutrophils both engulf; recruitment means additional cells arrive.', transfer: 'Level 5 asks you to retain phagocytes alongside antibody support.', pathogens: ['e-coli', 'susceptible'], unlock: 'macrophage', learningCheck: 'recruit' },
    { id: 3, name: 'Outside support', subtitle: 'Read the lab card', duration: 90, objective: 'Distinguish bacterial growth inhibition from killing.', decision: 'Choose a medicine after seeing the isolate report.', feedback: 'Amoxicillin damages susceptible multiplying bacteria. Doxycycline suppresses growth; phagocytes still clear them.', transfer: 'Level 4 changes susceptibility while keeping the same species.', pathogens: ['susceptible'], learningCheck: 'medicine' },
    { id: 4, name: 'Read the resistance', subtitle: 'Same species, new result', duration: 90, objective: 'Use susceptibility evidence rather than a species-only match.', decision: 'Select doxycycline for the beta-lactamase-positive isolate.', feedback: 'Amoxicillin is inactive here. This microbe has resistance; your squad did not become accustomed to medicine.', transfer: 'Level 9 reverses the susceptibility pattern without the original recommendation.', pathogens: ['beta-lactamase'], learningCheck: 'susceptibility' },
    { id: 5, name: 'Tag & engulf', subtitle: 'Antibodies join the patrol', duration: 90, objective: 'Use matching antibody opsonization with phagocytes.', decision: 'Recruit plasma support while keeping phagocytes.', feedback: 'Plasma cells supply antibodies; tags improve phagocyte uptake. Tags alone do no damage.', transfer: 'Level 6 mixes matching and mismatching epitopes.', pathogens: ['pneumococcus', 'susceptible', 'beta-lactamase'], boss: 'colony-crown', unlock: 'plasma', learningCheck: 'cooperation' },
    { id: 6, name: 'A different shape', subtitle: 'Match the epitope', duration: 90, objective: 'Distinguish epitope identity from organism identity.', decision: 'Choose antibody A or B for the visible surface marker.', feedback: 'Antibody A cannot tag epitope B in this model. Matching is separate from affinity and effector function.', transfer: 'Level 8 tests matching recall and later introduces B without the first hint.', pathogens: ['antigen-b', 'pneumococcus', 'e-coli'], learningCheck: 'antigen' },
    { id: 7, name: 'The selection room', subtitle: 'Meet Candida · antifungal support', duration: 90, objective: 'Select an improved-binding B-cell clone.', decision: 'Compare weak, unchanged, and stronger-binding clones in the germinal center.', feedback: 'B-cell genes vary; better-binding clones gain representation with antigen capture and Tfh help. Secreted antibodies do not mutate.', transfer: 'Level 8 uses your selected affinity in a matching-antigen encounter.', pathogens: ['candida', 'susceptible'], learningCheck: 'affinity' },
    { id: 8, name: 'A familiar face', subtitle: 'Matching recall', duration: 90, objective: 'Recall benefits matching antigen rather than every pathogen.', decision: 'Use the selected A profile, then respond to an unfamiliar B epitope.', feedback: 'Improved affinity helps against matching A. It gives no automatic binding to B.', transfer: 'Level 10 combines both epitopes without an initial matching hint.', pathogens: ['susceptible', 'antigen-b', 'e-coli', 'pneumococcus'], learningCheck: 'recall' },
    { id: 9, name: 'No universal best', subtitle: 'Pseudomonas · a new lab report', duration: 90, objective: 'Transfer susceptibility-based choices to a changed isolate.', decision: 'Compare Pseudomonas with other isolates and equip a tested-susceptible antibiotic.', feedback: 'The newer unlock is not universally stronger. Each isolate report matters.', transfer: 'Level 10 includes resistance to both options and cooperative recovery.', pathogens: ['pseudomonas', 'doxy-resistant', 'beta-lactamase'], learningCheck: 'susceptibility' },
    { id: 10, name: 'Immune patrol', subtitle: 'Bring it all together', duration: 90, objective: 'Combine susceptibility, epitope matching, and cooperative clearance.', decision: 'Adapt support to mixed tested isolates and the boss.', feedback: 'The MRSA colony resists the modeled antibiotics. Candida needs antifungal support; Pseudomonas follows its own report. Matching tags and phagocytes cooperate; no single tool solves every encounter.', transfer: 'Replay seeded lanes and explain which evidence changed each choice; human evaluation remains required.', pathogens: ['dual-resistant', 'pseudomonas', 'candida', 'pneumococcus', 'e-coli', 'antigen-b'], boss: 'shield-colony', learningCheck: 'integration' },
];
export function medicineEffect(medicineId: MedicineId, pathogenId: PathogenId | 'virus'): {
    effective: boolean;
    effect: 'kill' | 'inhibit' | 'none';
    feedback: string;
} {
    if (pathogenId === 'virus')
        return { effective: false, effect: 'none', feedback: 'No viral target: the modeled antibiotics and antifungal do not treat viruses.' };
    const pathogen = PATHOGENS.find(p => p.id === pathogenId);
    const medicine = MEDICINES.find(m => m.id === medicineId);
    if (!pathogen || !medicine)
        return { effective: false, effect: 'none', feedback: 'Unsupported interaction: no effect modeled.' };
    if (pathogen.kind !== medicine.target)
        return { effective: false, effect: 'none', feedback: `${medicine.name} has no modeled ${pathogen.kind === 'fungus' ? 'fungal' : 'bacterial'} target. This is a target mismatch, not acquired resistance.` };
    if (pathogen.susceptibility[medicineId] !== 'susceptible')
        return { effective: false, effect: 'none', feedback: `Lab: ${medicine.name} resistant. Use the report; phagocytes remain available.` };
    return { effective: true, effect: medicine.effect, feedback: medicine.target === 'fungus' ? 'Susceptible Candida: fungal beta-glucan synthesis disrupted. Antifungal support assists host clearance.' : medicine.effect === 'kill' ? 'Susceptible: disrupted cell-wall synthesis damages multiplying bacteria.' : 'Susceptible: growth inhibited. Phagocytes still do the clearing.' };
}
export function antibodyMatch(profile: AntibodyProfile, pathogenId: PathogenId): boolean {
    return profile.effector === 'opsonization' && Number.isFinite(profile.affinity) && profile.affinity > 0 && PATHOGENS.find(p => p.id === pathogenId)?.epitope === profile.epitope;
}
export const CLONES: Array<{
    id: string;
    name: string;
    profile: AntibodyProfile;
    change: string;
}> = [
    { id: 'weak', name: 'Clone 1 · weak binding', profile: { epitope: 'A', affinity: 0.2, effector: 'opsonization' }, change: 'A mutation reduced binding.' },
    { id: 'neutral', name: 'Clone 2 · unchanged', profile: { epitope: 'A', affinity: 0.45, effector: 'opsonization' }, change: 'Variation did not improve binding.' },
    { id: 'strong', name: 'Clone 3 · stronger binding', profile: { epitope: 'A', affinity: 0.9, effector: 'opsonization' }, change: 'Better antigen capture supports selection with T-follicular-helper signals.' },
];
export const FIELD_GUIDE = [
    { title: 'About this patrol', text: 'Educational game abstraction, not treatment guidance. These are specified pathogenic extracellular bacterial and yeast encounters; many microbes are harmless or helpful and not every infection requires antibiotics.' },
    { title: 'The contact lane', text: 'Distance, timing and cell counts are compressed. Individual cells approach, extend pseudopods, enclose a microbe in a phagosome, then show a brief phagolysosome digestion vignette. Timing, scale and molecular diffusion are compressed. Large colony encounters represent multiple microbes; each bite removes a colony fragment. Neutrophils and macrophages do not make medicines or antibodies.' },
    { title: 'External medicines', text: 'External medicine pulses show wall stress or growth inhibition separately from cell actions. Cells do not shoot medicines. Damage and visible wall contours are teaching abstractions, not literal drug behavior. Labels show fictional, explicitly tested isolates; species alone never guarantees susceptibility. No prescribing regimen is provided.' },
    { title: 'Susceptibility is local', text: 'Amoxicillin disrupts cell-wall synthesis; doxycycline inhibits protein synthesis. Neither is universally best. Microbes carry resistance; exposure does not instantly create it in every microbe.' },
    { title: 'Tagging is teamwork', text: 'Modeled IgG-like antibodies bind a specific surface epitope and support engulfment by Fc-receptor-bearing phagocytes. Binding alone does not kill. A/B are teaching labels, not named clinical antigens.' },
    { title: 'Complement is distinct', text: 'Complement is a protein system, not a white-cell type or an antibody. C3-derived opsonins can aid phagocytosis. From patrol 5, a timed C3 opsonin pulse helps phagocytes engulf, especially encapsulated pneumococci. It does not directly kill; lysis is not simulated.' },
    { title: 'Germinal-center selection', text: 'Between encounters, B-cell clones vary and compete for antigen capture and T-follicular-helper support. Stronger binding can favor representation. Antibodies themselves do not learn. Days-to-weeks biology is compressed into an interlude.' },
    { title: 'Switching is different', text: 'Class switching changes antibody constant regions and effector properties; it does not inherently improve binding affinity or change specificity. It is explained here, not a playable damage upgrade.' },
    { title: 'Remembering a shape', text: 'Recall favors a matching encountered antigen. It is not universal protection and does not suggest deliberate infection. No measured learning or clinical validation is claimed.' },
];

export const availableMedicines = (level: number) => MEDICINES.filter(m => m.unlockLevel <= level);
export const medicineName = (id: MedicineId) => MEDICINES.find(m => m.id === id)!.name;
