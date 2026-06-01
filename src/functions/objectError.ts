export const objectError = ({ name, msg }: { name: string; msg: string }): Record<string, { message: string }> => {
	if (name.includes('.')) {
		const parts = name.split('.');
		const root: Record<string, unknown> = {};
		let cur: Record<string, unknown> = root;
		for (let i = 0; i < parts.length - 1; i += 1) {
			const key = parts[i];
			if (!cur[key]) {
				cur[key] = {};
			}
			cur = cur[key] as Record<string, unknown>;
		}
		cur[parts[parts.length - 1]] = { message: msg };
		return root as Record<string, { message: string }>;
	}
	return {
		[name]: { message: msg },
	};
};
