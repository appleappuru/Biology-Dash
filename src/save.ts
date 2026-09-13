import { RULES_VERSION, type Learning } from './simulation';
import type { AntibodyProfile } from './content';
export interface Save {
    version: number;
    completed: number[];
    stars: Record<string, number>;
    credits: number;
    bestScores: Record<string, number>;
    reinforcement: number;
    muted: boolean;
    volume: number;
    reducedMotion: boolean;
    tutorial: boolean;
    antibody: AntibodyProfile;
    checks: Partial<Learning>;
}
export const freshSave = (): Save => ({ version: RULES_VERSION, completed: [], stars: {}, credits: 0, bestScores: {}, reinforcement: 0, muted: false, volume: .25, reducedMotion: false, tutorial: false, antibody: { epitope: 'A', affinity: .45, effector: 'opsonization' }, checks: {} });
export function parseSave(raw: string | null): Save { try {
    const v = JSON.parse(raw ?? 'null');
    // Version 2 changes encounter rules, not the persisted progression schema.
    if (!v || ![1, RULES_VERSION].includes(v.version))
        return freshSave();
    const d = freshSave();
    d.completed = Array.isArray(v.completed) ? [...new Set<number>(v.completed.filter((x: unknown) => Number.isInteger(x) && Number(x) >= 1 && Number(x) <= 10))] : [];
    d.bestScores = Object.fromEntries(Object.entries(v.bestScores ?? {}).filter(([key, value]) => Number.isInteger(Number(key)) && Number(key)>=1 && Number(key)<=10 && Number.isInteger(value) && Number(value)>=0 && Number(value)<=100000).map(([key,value])=>[key,Number(value)]));
    d.credits = Number.isFinite(v.credits) ? Math.max(0, Math.min(10000, v.credits)) : 0;
    d.reinforcement = Math.max(0, Math.min(6, Number(v.reinforcement) || 0));
    d.muted = v.muted === true;
    d.volume = Number.isFinite(v.volume) ? Math.max(0, Math.min(1, v.volume)) : .25;
    d.reducedMotion = v.reducedMotion === true;
    d.tutorial = v.tutorial === true;
    if (v.antibody?.effector === 'opsonization' && v.antibody?.epitope === 'A' && [.2, .45, .9].includes(v.antibody?.affinity))
        d.antibody = v.antibody;
    d.stars = Object.fromEntries(Object.entries(v.stars ?? {}).filter(([k, val]) => Number(k) >= 1 && Number(k) <= 10 && Number.isInteger(val) && Number(val) >= 1 && Number(val) <= 3).map(([k, v]) => [k, Number(v)]));
    for (const key of ['medicine', 'cooperation', 'match', 'mismatch', 'affinity', 'recall', 'gate'] as const)
        d.checks[key] = v.checks?.[key] === true;
    return d;
}
catch {
    return freshSave();
} }
export const SAVE_KEY = 'biology-dash-v1';
export function loadSave() { try {
    return parseSave(localStorage.getItem(SAVE_KEY));
}
catch {
    return freshSave();
} }
export function writeSave(save: Save) { try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
}
catch {
    return false;
} }
export function isUnlocked(save: Save, level: number) { return level === 1 || save.completed.includes(level - 1); }
export function completeLevel(save: Save, level: number, squad: number, checks: Partial<Learning>, score = 0) { save.bestScores[level] = Math.max(save.bestScores[level] ?? 0, Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0); const first = !save.completed.includes(level); if (first) {
    save.completed.push(level);
    save.credits += 30;
} save.stars[level] = Math.max(save.stars[level] ?? 0, squad >= 12 ? 3 : squad >= 6 ? 2 : 1); for (const k of Object.keys(checks) as (keyof Learning)[])
    save.checks[k] ||= checks[k]; return first; }
export const UNLOCK_CATALOG = [{ id: 'reinforcement', cost: 30, max: 6, description: '+1 starting defender' }] as const;
export function purchaseReinforcement(save: Save) { if (save.credits < 30 || save.reinforcement >= 6)
    return false; save.credits -= 30; save.reinforcement++; return true; }
