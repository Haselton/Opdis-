// SPDX-License-Identifier: MIT
import { runBatch, validateCases, validateRecipe } from './core.mjs';

export async function propose(base, training, peer, infer) {
  validateRecipe(base);
  validateCases(training);
  const examples = training.slice(0, 8).map(x => ({ input: x.prompt.slice(0, 450), target: x.expected.slice(0, 100) }));
  const prompt = JSON.stringify({ previous: base.instruction, training: examples });
  const result = await infer(peer, prompt,
    'Suggest one general instruction for future inputs of this type. Return only instruction text. ' +
    'Do not include any individual example, case-specific lookup, executable code or tool call.');
  if (typeof result.answer !== 'string' || !result.answer.trim()) throw new Error('Empty proposal.');
  return validateRecipe({ id: 'candidate', instruction: result.answer.trim() });
}

export async function compare(training, heldout, base, candidate, peers, infer) {
  validateCases(training);
  validateCases(heldout);
  const trainIds = new Set(training.map(x => x.id));
  const trainInputs = new Set(training.map(x => x.prompt.trim().toLowerCase()));
  if (heldout.some(x => trainIds.has(x.id) || trainInputs.has(x.prompt.trim().toLowerCase())))
    throw new Error('The training and held-out suites overlap.');
  const baseline = await runBatch(heldout, peers, base, infer);
  const trial = await runBatch(heldout, peers, candidate, infer);
  const byId = new Map(baseline.rows.map(r => [r.id, r]));
  const gains = trial.rows.filter(r => r.correct && !byId.get(r.id).correct).map(r => r.id);
  const regressions = trial.rows.filter(r => !r.correct && byId.get(r.id).correct).map(r => r.id);
  const complete = baseline.errors + trial.errors === 0 &&
    baseline.activePeers === peers.length && trial.activePeers === peers.length;
  return { baseline, trial, gains, regressions, eligibleForReview: complete && gains.length > 0 && !regressions.length };
}
