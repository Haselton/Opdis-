// SPDX-License-Identifier: MIT
export function validateCases(cases) {
  if (!Array.isArray(cases) || cases.length === 0 || cases.length > 10000)
    throw new Error('Supply between 1 and 10000 cases.');
  const ids = new Set();
  for (const item of cases) {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
        typeof item.prompt !== 'string' || !item.prompt || item.prompt.length > 8000 ||
        typeof item.expected !== 'string' || !item.expected.trim())
      throw new Error('Each case needs a unique id, prompt and expected string.');
    ids.add(item.id);
  }
}

export function validateRecipe(recipe) {
  if (!recipe || typeof recipe.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(recipe.id) ||
      typeof recipe.instruction !== 'string' || recipe.instruction.length > 1500)
    throw new Error('A recipe needs a short id and a bounded text instruction.');
  return recipe;
}

export async function runBatch(cases, peers, recipe, infer) {
  validateCases(cases);
  validateRecipe(recipe);
  if (!peers.length || new Set(peers).size !== peers.length)
    throw new Error('Supply distinct peer endpoints.');
  const rows = Array(cases.length);
  let cursor = 0;
  async function work(peer, index) {
    while (cursor < cases.length) {
      const i = cursor++;
      const { id, prompt, expected } = cases[i];
      try {
        const result = await infer(peer, prompt, recipe.instruction);
        if (!result || typeof result.answer !== 'string' || !result.digest ||
            !Number.isFinite(result.vramBytes) || result.vramBytes <= 0)
          throw new Error('Missing model output or GPU residency evidence.');
        rows[i] = { id, peer: index + 1, correct: result.answer.trim() === expected.trim(),
          digest: result.digest, vramBytes: result.vramBytes, evalTokens: result.evalTokens ?? 0 };
      } catch (error) {
        rows[i] = { id, peer: index + 1, correct: false, error: String(error.message || error) };
      }
    }
  }
  await Promise.all(peers.map(work));
  const completed = rows.filter(row => !row.error);
  const digests = new Set(completed.map(row => row.digest));
  if (digests.size > 1) throw new Error('Model digests differ between responses.');
  return { recipe: recipe.id, total: rows.length, solved: rows.filter(row => row.correct).length,
    errors: rows.length - completed.length, activePeers: new Set(completed.map(row => row.peer)).size,
    rows };
}
