/** Stable, irregular packed positions: adding a recruit never reshuffles existing cells. */
export function cellOffset(index: number) {
    if (index === 0) return { x: 0, y: 0 };
    const angle = index * 2.399963229728653 + Math.sin(index * 7.13) * .12;
    const radius = Math.sqrt(index) * 16.5;
    return { x: Math.cos(angle) * radius * 1.06, y: Math.sin(angle) * radius * .72 };
}
