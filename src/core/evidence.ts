/**
 * Biology Dash: Immune Patrol
 * Evidence-Based Biological Records & Clinical Pharmacology Database
 */

export interface MedicalRecord {
  id: string;
  name: string;
  category: 'defender' | 'pathogen' | 'antimicrobial';
  scientificName: string;
  mechanism: string;
  clinicalRelevance: string;
  spectrumNotes: string;
}

export const MEDICAL_EVIDENCE_RECORDS: MedicalRecord[] = [
  // Defenders
  {
    id: 'neutrophil',
    name: 'Neutrophil',
    category: 'defender',
    scientificName: 'Polymorphonuclear Leukocyte (PMN)',
    mechanism: 'Rapid extravasation, phagocytosis, release of reactive oxygen species (ROS) and defensins.',
    clinicalRelevance: 'First responders to bacterial invasion; essential in acute inflammatory defense.',
    spectrumNotes: 'Effective against most extracellular bacteria; short lifespan (hours to days).',
  },
  {
    id: 'macrophage',
    name: 'Macrophage',
    category: 'defender',
    scientificName: 'Monocyte-derived Macrophage',
    mechanism: 'Broad-reach pseudopod extension, phagocytosis, antigen presentation via MHC class II, cytokine secretion.',
    clinicalRelevance: 'Long-lived sentinel cell; orchestrates tissue repair and sustained clearance.',
    spectrumNotes: 'Engulfs large bacterial clusters, cellular debris, and apoptotic neutrophils.',
  },
  {
    id: 'plasma_cell',
    name: 'Plasma Cell',
    category: 'defender',
    scientificName: 'Differentiated B Lymphocyte',
    mechanism: 'Hyper-secretion of antigen-specific IgG antibodies (thousands per second) for opsonization and neutralization.',
    clinicalRelevance: 'Constitutes the humoral arm of adaptive immunity; facilitates phagocyteFc receptor binding.',
    spectrumNotes: 'Accelerates phagocytic clearance 2x to 5x via C3b and Fc-gamma receptor opsonization.',
  },

  // Pathogens
  {
    id: 's_aureus',
    name: 'Staphylococcus aureus',
    category: 'pathogen',
    scientificName: 'Staphylococcus aureus (Gram-positive cocci)',
    mechanism: 'Forms golden grape-like clusters; produces coagulase, protein A, and pore-forming exotoxins.',
    clinicalRelevance: 'Common cause of skin, soft tissue, bacteremic, and device-associated infections.',
    spectrumNotes: 'Susceptible to aminopenicillins unless beta-lactamase positive or harboring mecA (MRSA).',
  },
  {
    id: 'beta_lactamase_sa',
    name: 'Beta-Lactamase+ S. aureus',
    category: 'pathogen',
    scientificName: 'S. aureus (blaZ positive)',
    mechanism: 'Secretes beta-lactamase enzyme that hydrolyzes the 4-membered beta-lactam ring of amoxicillin.',
    clinicalRelevance: 'Renders natural penicillins and aminopenicillins completely clinically ineffective.',
    spectrumNotes: 'Requires beta-lactamase inhibitor (clavulanate) or alternative class (tetracyclines).',
  },
  {
    id: 'mrsa',
    name: 'MRSA',
    category: 'pathogen',
    scientificName: 'Methicillin-Resistant Staphylococcus aureus',
    mechanism: 'Carries mecA gene encoding low-affinity Penicillin-Binding Protein 2a (PBP2a).',
    clinicalRelevance: 'Major nosocomial and community-acquired multidrug-resistant pathogen.',
    spectrumNotes: 'Resistant to all standard beta-lactams; requires vancomycin, daptomycin, or ceftaroline.',
  },
  {
    id: 'pseudomonas',
    name: 'Pseudomonas aeruginosa',
    category: 'pathogen',
    scientificName: 'Pseudomonas aeruginosa (Gram-negative rod)',
    mechanism: 'Active multi-drug efflux pumps (MexAB-OprM), low outer membrane permeability, pyocyanin toxin.',
    clinicalRelevance: 'Opportunistic pathogen in cystic fibrosis, burns, and immunocompromised patients.',
    spectrumNotes: 'Intrinsically resistant to amoxicillin; requires anti-pseudomonal cephalosporins (cefepime).',
  },
  {
    id: 'candida',
    name: 'Candida albicans',
    category: 'pathogen',
    scientificName: 'Candida albicans (Eukaryotic Yeast)',
    mechanism: 'Dimorphic yeast-to-hyphae transition, thick 1,3-beta-D-glucan and chitin cell wall.',
    clinicalRelevance: 'Opportunistic fungal infection after broad-spectrum antibiotic disruption of flora.',
    spectrumNotes: 'Antibiotics have zero efficacy against fungi; requires echinocandins (micafungin).',
  },

  // Antimicrobial Drugs
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    category: 'antimicrobial',
    scientificName: 'Aminopenicillin (Beta-Lactam)',
    mechanism: 'Competitive inhibition of transpeptidase enzymes; halts peptidoglycan cell wall cross-linking.',
    clinicalRelevance: 'First-line oral antibiotic for otitis media, strep throat, and uncomplicated skin infections.',
    spectrumNotes: 'Active against S. aureus, Streptococcus pneumoniae, and select Gram-negatives.',
  },
  {
    id: 'doxycycline',
    name: 'Doxycycline',
    category: 'antimicrobial',
    scientificName: 'Tetracycline (30S Ribosome Inhibitor)',
    mechanism: 'Reversibly binds to the 30S ribosomal subunit, preventing tRNA binding and halting translation.',
    clinicalRelevance: 'Broad-spectrum bacteriostatic agent for atypical pneumonia, MRSA skin infections, and Lyme.',
    spectrumNotes: 'Freezes bacterial replication; ineffective against Candida and highly resistant strains.',
  },
  {
    id: 'cefepime',
    name: 'Cefepime',
    category: 'antimicrobial',
    scientificName: 'Fourth-Generation Cephalosporin',
    mechanism: 'High affinity for PBP3 and PBP1a; rapid penetration through outer-membrane porins.',
    clinicalRelevance: 'Hospital empiric therapy for febrile neutropenia and serious pseudomonal infections.',
    spectrumNotes: 'Zwitterionic structure enables broad Gram-negative and Gram-positive coverage.',
  },
  {
    id: 'micafungin',
    name: 'Micafungin',
    category: 'antimicrobial',
    scientificName: 'Echinocandin Antifungal',
    mechanism: 'Non-competitive inhibition of 1,3-beta-D-glucan synthase; collapses fungal cell wall integrity.',
    clinicalRelevance: 'First-line treatment for candidemia and invasive candidiasis.',
    spectrumNotes: 'Highly active against Candida species; zero antibacterial activity.',
  },
];

export const MEDICAL_DISCLAIMER =
  'Biology Dash: Immune Patrol is an educational game designed to foster intuitive understanding of cellular immunology, microbiology, and pharmacology. It is intended for educational and casual learning purposes only and does not constitute medical advice or clinical prescribing guidelines.';
