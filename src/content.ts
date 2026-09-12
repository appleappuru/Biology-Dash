/** Evidence-backed compatibility is separate from deliberately abstract balance values. */
export type DefenderId = 'neutrophil' | 'macrophage' | 'plasma';
export type MedicineId = 'amoxicillin' | 'doxycycline';
export type PathogenId = 'susceptible' | 'beta-lactamase' | 'doxy-resistant' | 'dual-resistant' | 'antigen-b';
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
    mechanism: string;
    limitation: string;
}
export interface Pathogen {
    id: PathogenId;
    name: string;
    species: string;
    kind: 'bacterium';
    context: 'extracellular';
    epitope: Epitope;
    susceptibility: Record<MedicineId, 'susceptible' | 'resistant'>;
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
    { id: 'amoxicillin', name: 'Amoxicillin', effect: 'kill', mechanism: 'Disrupts cell-wall synthesis in susceptible, multiplying bacteria.', limitation: 'This encounter assumes a tested susceptible, beta-lactamase-negative isolate. No antibacterial activity against viruses.' },
    { id: 'doxycycline', name: 'Doxycycline', effect: 'inhibit', mechanism: 'Inhibits bacterial protein synthesis at the 30S ribosome; slows growth.', limitation: 'Requires isolate susceptibility. Growth inhibition is not immediate killing or a guaranteed clinical outcome.' },
];
export const PATHOGENS: Pathogen[] = [
    { id: 'susceptible', name: 'Tested susceptible', species: 'S. aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'susceptible' }, clue: 'Lab: both susceptible; beta-lactamase negative, methicillin susceptible.', hp: 22, speed: 48, color: 0x86bd61 },
    { id: 'beta-lactamase', name: 'Beta-lactamase +', species: 'S. aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'resistant', doxycycline: 'susceptible' }, clue: 'Lab: amoxicillin resistant; doxycycline susceptible. Beta-lactamase breaks down amoxicillin.', hp: 27, speed: 51, color: 0xd2a75b },
    { id: 'doxy-resistant', name: 'Doxycycline R', species: 'S. aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'resistant' }, clue: 'Lab: doxycycline resistant; amoxicillin susceptible, beta-lactamase negative, methicillin susceptible.', hp: 25, speed: 62, color: 0xda899d },
    { id: 'dual-resistant', name: 'Both drugs R', species: 'S. aureus', kind: 'bacterium', context: 'extracellular', epitope: 'A', susceptibility: { amoxicillin: 'resistant', doxycycline: 'resistant' }, clue: 'Lab: resistant to both modeled drugs. Phagocyte/antibody cooperation still helps in this simplified encounter.', hp: 32, speed: 42, color: 0x9d8bc2 },
    { id: 'antigen-b', name: 'Different epitope B', species: 'S. aureus', kind: 'bacterium', context: 'extracellular', epitope: 'B', susceptibility: { amoxicillin: 'susceptible', doxycycline: 'susceptible' }, clue: 'Surface epitope B, not A. Lab: both drugs susceptible; beta-lactamase negative, methicillin susceptible.', hp: 24, speed: 56, color: 0x55bfc1 },
];
export const BOSSES = [
    { id: 'colony-crown', name: 'Colony Crown', pathogenId: 'susceptible' as PathogenId, description: 'A theatrical enlarged susceptible colony. Size does not cause resistance.' },
    { id: 'shield-colony', name: 'Mosaic Monarch', pathogenId: 'dual-resistant' as PathogenId, description: 'A theatrical colony with explicitly tested resistance. Its size is unrelated to resistance.' },
] as const;
export const LEVELS: Level[] = [
    { id: 1, name: 'First response', subtitle: 'Learn the patrol', duration: 90, objective: 'Steer phagocytes into close contact with bacteria.', decision: 'Intercept an approaching cluster and collect arriving cells.', feedback: 'Close-range engulfment clears bacteria. Cells crossing the tissue line cost one defender: breach rescue.', transfer: 'Level 2 introduces a new cluster lane without the steering hint.', pathogens: ['susceptible'], learningCheck: 'steer' },
    { id: 2, name: 'Better together', subtitle: 'Recruit the resident team', duration: 90, objective: 'Recognize overlapping phagocyte roles.', decision: 'Choose recruitment or wider contact coverage.', feedback: 'Macrophages and neutrophils both engulf; recruitment means additional cells arrive.', transfer: 'Level 5 asks you to retain phagocytes alongside antibody support.', pathogens: ['susceptible', 'antigen-b'], unlock: 'macrophage', learningCheck: 'recruit' },
    { id: 3, name: 'Outside support', subtitle: 'Read the lab card', duration: 90, objective: 'Distinguish bacterial growth inhibition from killing.', decision: 'Choose a medicine after seeing the isolate report.', feedback: 'Amoxicillin damages susceptible multiplying bacteria. Doxycycline suppresses growth; phagocytes still clear them.', transfer: 'Level 4 changes susceptibility while keeping the same species.', pathogens: ['susceptible'], learningCheck: 'medicine' },
    { id: 4, name: 'Read the resistance', subtitle: 'Same species, new result', duration: 90, objective: 'Use susceptibility evidence rather than a species-only match.', decision: 'Select doxycycline for the beta-lactamase-positive isolate.', feedback: 'Amoxicillin is inactive here. This microbe has resistance; your squad did not become accustomed to medicine.', transfer: 'Level 9 reverses the susceptibility pattern without the original recommendation.', pathogens: ['beta-lactamase'], learningCheck: 'susceptibility' },
    { id: 5, name: 'Tag & engulf', subtitle: 'Antibodies join the patrol', duration: 90, objective: 'Use matching antibody opsonization with phagocytes.', decision: 'Recruit plasma support while keeping phagocytes.', feedback: 'Plasma cells supply antibodies; tags improve phagocyte uptake. Tags alone do no damage.', transfer: 'Level 6 mixes matching and mismatching epitopes.', pathogens: ['susceptible', 'beta-lactamase'], boss: 'colony-crown', unlock: 'plasma', learningCheck: 'cooperation' },
    { id: 6, name: 'A different shape', subtitle: 'Match the epitope', duration: 90, objective: 'Distinguish epitope identity from organism identity.', decision: 'Choose antibody A or B for the visible surface marker.', feedback: 'Antibody A cannot tag epitope B in this model. Matching is separate from affinity and effector function.', transfer: 'Level 8 tests matching recall and later introduces B without the first hint.', pathogens: ['antigen-b', 'susceptible'], learningCheck: 'antigen' },
    { id: 7, name: 'The selection room', subtitle: 'A lymph-node interlude', duration: 90, objective: 'Select an improved-binding B-cell clone.', decision: 'Compare weak, unchanged, and stronger-binding clones in the germinal center.', feedback: 'B-cell genes vary; better-binding clones gain representation with antigen capture and Tfh help. Secreted antibodies do not mutate.', transfer: 'Level 8 uses your selected affinity in a matching-antigen encounter.', pathogens: ['susceptible', 'beta-lactamase'], learningCheck: 'affinity' },
    { id: 8, name: 'A familiar face', subtitle: 'Matching recall', duration: 90, objective: 'Recall benefits matching antigen rather than every pathogen.', decision: 'Use the selected A profile, then respond to an unfamiliar B epitope.', feedback: 'Improved affinity helps against matching A. It gives no automatic binding to B.', transfer: 'Level 10 combines both epitopes without an initial matching hint.', pathogens: ['susceptible', 'antigen-b'], learningCheck: 'recall' },
    { id: 9, name: 'No universal best', subtitle: 'A reversed report', duration: 90, objective: 'Transfer susceptibility-based choices to a changed isolate.', decision: 'Read amoxicillin S / doxycycline R and select compatible support.', feedback: 'The newer unlock is not universally stronger. Each isolate report matters.', transfer: 'Level 10 includes resistance to both options and cooperative recovery.', pathogens: ['doxy-resistant', 'beta-lactamase'], learningCheck: 'susceptibility' },
    { id: 10, name: 'Immune patrol', subtitle: 'Bring it all together', duration: 90, objective: 'Combine susceptibility, epitope matching, and cooperative clearance.', decision: 'Adapt support to mixed tested isolates and the boss.', feedback: 'The large colony resists these drugs because of its tested phenotype. Matching tags and phagocytes cooperate; no single tool solves every encounter.', transfer: 'Replay shuffled seeded lanes and explain which evidence changed each choice; human evaluation remains required.', pathogens: ['dual-resistant', 'antigen-b', 'doxy-resistant', 'beta-lactamase', 'susceptible'], boss: 'shield-colony', learningCheck: 'integration' },
];
export function medicineEffect(medicineId: MedicineId, pathogenId: PathogenId | 'virus'): {
    effective: boolean;
    effect: 'kill' | 'inhibit' | 'none';
    feedback: string;
} {
    if (pathogenId === 'virus')
        return { effective: false, effect: 'none', feedback: 'No antibacterial target: antibiotics do not treat viruses. This is not acquired bacterial resistance.' };
    const pathogen = PATHOGENS.find(p => p.id === pathogenId);
    const medicine = MEDICINES.find(m => m.id === medicineId);
    if (!pathogen || !medicine)
        return { effective: false, effect: 'none', feedback: 'Unsupported interaction: no effect modeled.' };
    if (pathogen.susceptibility[medicineId] !== 'susceptible')
        return { effective: false, effect: 'none', feedback: `Lab: ${medicine.name} resistant. Use the report; phagocytes remain available.` };
    return { effective: true, effect: medicine.effect, feedback: medicine.effect === 'kill' ? 'Susceptible: disrupted cell-wall synthesis damages multiplying bacteria.' : 'Susceptible: growth inhibited. Phagocytes still do the clearing.' };
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
    { title: 'About this patrol', text: 'Educational game abstraction, not treatment guidance. These are specified pathogenic extracellular encounters; many microbes are harmless or helpful and not every infection requires antibiotics.' },
    { title: 'The contact lane', text: 'Distance, timing and cell counts are compressed. Short engulfment arcs visualize phagocytosis. Neutrophils and macrophages do not make medicines or antibodies.' },
    { title: 'External medicines', text: 'Medicine pulses visualize an external effect, not injections or doses. Labels show fictional, explicitly tested isolates; species alone never guarantees susceptibility. No prescribing regimen is provided.' },
    { title: 'Susceptibility is local', text: 'Amoxicillin disrupts cell-wall synthesis; doxycycline inhibits protein synthesis. Neither is universally best. Microbes carry resistance; exposure does not instantly create it in every microbe.' },
    { title: 'Tagging is teamwork', text: 'Modeled IgG-like antibodies bind a specific surface epitope and support engulfment by Fc-receptor-bearing phagocytes. Binding alone does not kill. A/B are teaching labels, not named clinical antigens.' },
    { title: 'Complement is distinct', text: 'Complement is a protein system, not a white-cell type or an antibody. C3-derived opsonins can aid phagocytosis. Complement lysis and synergy are not simulated here.' },
    { title: 'Germinal-center selection', text: 'Between encounters, B-cell clones vary and compete for antigen capture and T-follicular-helper support. Stronger binding can favor representation. Antibodies themselves do not learn. Days-to-weeks biology is compressed into an interlude.' },
    { title: 'Switching is different', text: 'Class switching changes antibody constant regions and effector properties; it does not inherently improve binding affinity or change specificity. It is explained here, not a playable damage upgrade.' },
    { title: 'Remembering a shape', text: 'Recall favors a matching encountered antigen. It is not universal protection and does not suggest deliberate infection. No measured learning or clinical validation is claimed.' },
];
