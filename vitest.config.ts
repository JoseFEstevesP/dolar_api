import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
		exclude: ['node_modules', 'dist'],
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
});
