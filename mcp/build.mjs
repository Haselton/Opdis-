import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const draft = await build({ absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  entryPoints: ['form.mjs'], bundle: true, platform: 'browser', format: 'iife', minify: true, write: false });
await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  define: { OPDIS_DRAFT_JS: JSON.stringify(draft.outputFiles[0].text) },
  entryPoints: ['worker.mjs'], outfile: 'dist/worker.mjs', bundle: true, format: 'esm',
  platform: 'browser', target: 'es2022', minify: true, legalComments: 'eof',
  loader: { '.md': 'text', '.html': 'text' }
});
