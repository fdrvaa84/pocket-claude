import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  minify: true,
  splitting: false,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node\nimport{createRequire as __pcCreateRequire}from'module';const require=__pcCreateRequire(import.meta.url);",
  },
});
