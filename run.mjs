// SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';
import { runBatch } from './core.mjs';
import { peerURL, ollamaAdapter } from './ollama.mjs';

try {
  const [suiteFile, recipeFile, ...rawPeers] = process.argv.slice(2);
  if (!suiteFile || !recipeFile || !rawPeers.length)
    throw new Error('Usage: node run.mjs SUITE.json RECIPE.json PEER_URL [PEER_URL ...]');
  const peers = rawPeers.map(peerURL);
  const read = async path => JSON.parse(await readFile(path, 'utf8'));
  const infer = ollamaAdapter(process.env.OPDIS_MODEL, process.env.OPDIS_DIGEST || '');
  const start = performance.now();
  const report = await runBatch(await read(suiteFile), peers, await read(recipeFile), infer);
  report.wallMs = Math.round(performance.now() - start);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors || report.activePeers !== peers.length) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
