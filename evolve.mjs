// SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';
import { propose, compare } from './evolution.mjs';
import { peerURL, ollamaAdapter } from './ollama.mjs';

try {
  const [trainPath, heldoutPath, basePath, ...urls] = process.argv.slice(2);
  if (!trainPath || !heldoutPath || !basePath || !urls.length)
    throw new Error('Usage: node evolve.mjs TRAIN.json HOLDOUT.json BASE.json PEER_URL [PEER_URL ...]');
  const read = async path => JSON.parse(await readFile(path, 'utf8'));
  const [train, heldout, base] = await Promise.all([trainPath, heldoutPath, basePath].map(read));
  const peers = urls.map(peerURL);
  const infer = ollamaAdapter(process.env.OPDIS_MODEL, process.env.OPDIS_DIGEST || '');
  const candidate = await propose(base, train, peers[0], infer);
  const evidence = await compare(train, heldout, base, candidate, peers, infer);
  console.log(JSON.stringify({ candidate, ...evidence }, null, 2));
  if (evidence.baseline.errors || evidence.trial.errors ||
      evidence.baseline.activePeers !== peers.length || evidence.trial.activePeers !== peers.length) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
