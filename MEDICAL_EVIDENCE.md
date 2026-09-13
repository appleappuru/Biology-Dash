# Medical evidence and abstraction register

Checked **2026-09-12**. Status **source-checked, not independently clinically reviewed** applies to every implemented row. No claim of clinical validation or measured learning gains. Content is a mechanism teaching model, not a clinical efficacy calculator. No doses, durations, or patient-specific choices are provided.

## Authoritative references

- **A** [DailyMed amoxicillin label, indications and microbiology](https://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ef03286b-4ba7-4952-9ab1-90cacf300504): cell-wall action, beta-lactamase limitation, susceptible Staphylococcus skin/structure encounter.
- **D** [DailyMed doxycycline label, microbiology and indications](https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f4238118-f827-19da-e053-2a95a90aa5f0): 30S inhibition, bacteriostatic activity, susceptibility dependence. The [additional monohydrate label](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=96424d21-3fa4-4a32-8b98-fd593748f236) explicitly lists susceptible S. aureus skin/structure infection and says doxycycline is not the drug of choice for staphylococcal infections. The game does not imply preferred therapy.
- **P** [NCBI Molecular Biology of the Cell: Innate Immunity](https://www.ncbi.nlm.nih.gov/books/NBK26846/): engulfment and opsonin-receptor cooperation.
- **B** [NCBI Immunobiology: B-cell activation](https://www.ncbi.nlm.nih.gov/books/NBK27142/): plasma differentiation, antigen-specific responses, selection, switching.
- **G** [NCBI Molecular Biology of the Cell: Antibody Diversity](https://www.ncbi.nlm.nih.gov/books/NBK26860/): somatic variation and affinity selection.
- **T** [T follicular helper cell differentiation, function, and roles in disease](https://pubmed.ncbi.nlm.nih.gov/25367570/): Tfh assistance in germinal centers and memory.
- **C** [NCBI Immunobiology: Complement](https://www.ncbi.nlm.nih.gov/books/NBK27100/): complement-derived opsonins, context and receptor limitations.
- **V** [CDC: Antibiotic do's and don'ts](https://www.cdc.gov/antibiotic-use/about/index.html): antibiotics are not antiviral drugs; not every infection requires antibiotics.
- **R** [CDC: Antimicrobial resistance](https://www.cdc.gov/antimicrobial-resistance/about/index.html): microbes carry resistance, not the patient's acquired tolerance to medicines.

The older NCBI textbooks support stable introductory mechanisms; they do not supply current prescribing advice. Initial seed PMC4481323 was blocked by a browser challenge and was not used as evidence.

## Evidence table

All rows use the checked date/status above. Source keys resolve to exact URLs above. `S`/`R` denote **authored isolate test results**, not species-wide classifications or a dataset of real patient specimens.

| Stable ID | Mechanism and target | Susceptibility / context assumptions | Limitations | Game representation | Source |
|---|---|---|---|---|---|
| neutrophil | Phagocytosis of extracellular bacteria | Accessible bacterial targets | Not universal clearance; no antibody/drug secretion | Rapid short contact arcs | P |
| macrophage | Phagocytosis of extracellular bacteria | Accessible targets | Overlaps with neutrophils; pace is balance fiction | Steady contact clearance | P |
| plasma | Secretion of antigen-binding antibody | Modeled opsonic IgG-like profile | Not a phagocyte; not every antibody is opsonic | Matching tag support, zero direct killing | B, P |
| amoxicillin | Cell-wall synthesis inhibition | Growing tested susceptible bacteria; beta-lactamase-negative and methicillin-susceptible staphylococcal isolates | No universal species activity or clinical-outcome guarantee | External damage pulse | A |
| doxycycline | 30S protein-synthesis inhibition | Explicitly susceptible isolate | Growth inhibition differs from immediate killing | Suppresses modeled growth; phagocytes clear | D |
| susceptible | S. aureus, extracellular | A:S, D:S; beta-lactamase negative, methicillin susceptible | Deliberately specified uncommon susceptible profile, not empiric advice | Rounded green cluster, epitope A | A, D |
| beta-lactamase | S. aureus beta-lactamase phenotype | A:R, D:S by authored report | D susceptibility is separately given, never inferred from beta-lactamase | Amber cluster; plain lab clue | A, D |
| doxy-resistant | S. aureus tested doxycycline resistance | A:S, D:R; beta-lactamase negative, methicillin susceptible | Exact doxycycline resistance mechanism not asserted | Pink fast cluster | A, D |
| dual-resistant | S. aureus tested resistance to both | A:R, D:R | Does not imply resistance to every medicine or immunity | Violet cluster | A, D, R |
| antigen-b | S. aureus with different teaching epitope | A:S, D:S; beta-lactamase negative, methicillin susceptible | Epitope labels are schematic, not validated S. aureus antigen targets | Teal cluster, B marker | A, D, B |
| colony-crown | Enlarged susceptible colony | Inherits susceptible phenotype | Size conveys no resistance | First theatrical boss | A; visual fiction |
| shield-colony | Enlarged dual-resistant colony | Inherits dual-resistant report | Size conveys no resistance | Second theatrical boss | A, D; visual fiction |
| opsonization | Matching IgG-like binding facilitates uptake | Epitope match, positive affinity, phagocyte present | Binding alone does not kill; efficacy of a real anti-staphylococcal antibody is not claimed | Tags increase modeled engulfment | P |
| epitope-match | Antigen binding is specific | A binds A, B binds B | No unverified cross-reactivity; species and antigen are distinct fields | Mismatch gives no tag | B |
| affinity-selection | B-cell variation and selection | T-dependent germinal-center model | Includes weaker and unchanged clones; affinity score is not a biological measurement | Select among 0.2 / 0.45 / 0.9 clones | G, T |
| recall | Selected response to matching antigen | Matching prior A epitope | No universal immunity or deliberate-exposure recommendation | Stored profile reused on A, no B match | B, T |
| class-switching | Constant-region change | Explanatory only | Not automatic affinity improvement | Guide text only | B |
| complement | C3-derived opsonization | Explanatory only | Distinct from antibody/cell; lysis not modeled | Guide text only | C |
| virus-exclusion | No antibacterial drug target | Virus test sentinel, no viral combat roster | Lack of activity is not acquired bacterial resistance | Both medicines return no effect | V |
| resistance-rule | Microbial phenotype, not player tolerance | Static authored tests per isolate | No claim every exposure instantly generates resistance | Immutable compatibility despite upgrades | R |

## Explicit abstractions

All encounters represent bacteria outside host cells in an abstract tissue corridor. Bacterial intracellular survival, bacterial immune evasion, pharmacokinetics, exposure, biofilms, clinical severity, allergies and treatment selection are excluded. In-game health, movement, growth suppression, recruitment, timing and clearance probabilities are tuning values, not medical measurements. A medicine pulse depicts delivered external support. Short phagocyte arcs depict close contact. Recruitment is cell arrival, not division. Every in-game defender has a rendered cell, up to the 30-cell cap; these are abstract game units, not physiological cell counts. Boss shapes and colony scale are theatrical. S. aureus is coccal: render rounded clusters for all five phenotypes. Generated atlas rods must not be used as literal S. aureus silhouettes. Any retained variations are abstract phenotype mascots, never diagnostic morphology. A/B represent hypothetical antigenic epitopes and do not identify real diagnostic markers or a clinically effective antibody product. The drug-resistant phenotypes have **no automatic immune resistance bonus**. No combination synergy is asserted.

Affinity maturation occurs in an intervening lymph-node/germinal-center screen: B-cell variation, antigen capture, Tfh assistance, selection and a later matched recall. Days-to-weeks biology is compressed. Class switching is explained separately. Antibody molecules never mutate themselves.

## Learning acceptance and review questions

The ten `LEVELS` records contain objectives, decisions, explanatory feedback and later transfer encounters. Rule tests must verify susceptibility-dependent choice, antibody/phagocyte cooperation, match/mismatch, selection and matching recall. Human testing must ask players to explain the relationship and transfer it to a new report; victory alone is insufficient.

Before educational-authority marketing, obtain immunology/clinical review of: (1) whether the toy S. aureus epitope/IgG opsonization mapping gives a misleading impression of clinical antibody efficacy; (2) whether choosing explicitly amoxicillin-susceptible isolates sufficiently avoids teaching empiric use for staphylococci; (3) whether rendered growth suppression is clearly distinct from killing; (4) whether the selection/recall interlude communicates Tfh and antigen presentation adequately; (5) whether adolescents understand resistance as microbial and isolate-specific. No claim that these questions have been resolved by a qualified reviewer.
