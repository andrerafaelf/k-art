/**
 * Cards to a row on wide screens for a grid of n cards, so whatever the size
 * of the team no card is left alone on the last row: three or four across,
 * five when a big team only divides that way.
 */
export function columns(n: number) {
	if (n <= 4) return Math.max(n, 1);
	const options = n <= 6 ? [3, 4] : n <= 12 ? [4, 3, 5] : [4, 5, 3];
	return options.find((c) => n % c !== 1) ?? 4;
}
