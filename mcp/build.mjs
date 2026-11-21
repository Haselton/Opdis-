import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  entryPoints: ['worker.mjs'], outfile: 'dist/worker.mjs', bundle: true, format: 'esm',
  platform: 'browser', target: 'es2022', minify: true, legalComments: 'eof',
  loader: { '.md': 'text', '.html': 'text' }
});
