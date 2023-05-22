import type { Options } from 'tsup';

export const tsup: Options = {
	splitting: true,
	clean: true,
	dts: true,
	format: ['cjs', 'esm'],
	minify: true,
	bundle: true,
	skipNodeModulesBundle: true,
	entryPoints: ['src/index.ts'],
	external: ['rxjs'],
	target: 'es2018',
	outDir: 'dist',
	entry: ['src/**/*.ts', '!src/**/*.spec.ts'],
};
