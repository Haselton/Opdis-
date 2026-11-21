// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { validateCases } from '../core.mjs';
import publishedTrain from '../examples/train.json' with { type: 'json' };
import publishedSmoke from '../examples/heldout.json' with { type: 'json' };
const repo = 'https://github.com/Haselton/Opdis-';

const row = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
  prompt: z.string().trim().min(1).max(1000),
  expected: z.string().trim().min(1).max(200)
});
export const draftSchema = z.strictObject({
  author: z.string().trim().min(1).max(80).describe('Public handle for attribution'),
  family: z.string().trim().min(1).max(100).describe('Name for this original exact-answer task family'),
  rationale: z.string().trim().min(1).max(600).describe('Why each input has a single checkable answer'),
  train: z.array(row).length(2), smoke: z.array(row).length(2)
});
export function prepareDraft({ author, family, rationale, train, smoke }) {
  const items = [...publishedTrain, ...publishedSmoke, ...train, ...smoke];
  validateCases(items);
  const prompts = items.map(item => item.prompt.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase());
  if (new Set(prompts).size !== prompts.length) throw new Error('Use distinct prompts across both suites and the published examples.');
  return { status: 'draft', task: 'OPD-011', author, family, rationale,
    files: { 'train.json': train, 'smoke.json': smoke },
    scoring: 'Trim the answer and compare it exactly with expected.',
    review: 'Review the cases for originality and public redistribution. Include the two files, attribution and rationale in your GitHub contribution. Check the existing discussions first.',
    discussions: repo + '/issues?q=OPD-011', guide: repo + '/blob/main/CONTRIBUTING.md' };
}
