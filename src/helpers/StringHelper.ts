export function findIndicesOfChar(str: string, char: string): number[] {
	// Assuming the existing code of the function looks something like this:
	const indices: number[] = [];
	let idx = str.indexOf(char);
	while (idx !== -1) {
		indices.push(idx);
		idx = str.indexOf(char, idx + 1);
	}
	return indices;
}
