// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { validateCases } from '../core.mjs';
import tracker from '../PROJECT_PROGRESS.md';
import publishedTrain from '../examples/train.json' with { type: 'json' };
import publishedSmoke from '../examples/heldout.json' with { type: 'json' };

export const repo = 'https://github.com/Haselton/Opdis-';
const board = repo + '/blob/main/PROJECT_PROGRESS.md';
const evidenceCommit = '3eb84253bfb2286c7324c734f91611958e749ed4';
const evidenceSource = repo + '/blob/' + evidenceCommit + '/PROJECT_PROGRESS.md';
const allTasks = tracker.split('\n').filter(line => /^\| P\d \| OPD-\d+ \|/.test(line)).map(line => {
  const [priority, id, status, task, acceptance] = line.slice(1, -1).split('|').map(cell => cell.trim());
  return { id, priority, status, task, acceptance, discussion: repo + '/issues?q=' + encodeURIComponent(id) };
});
if (!allTasks.length) throw new Error('No OPDIS tasks found in the project tracker.');

const roleTasks = { phone: ['OPD-011'], gpu: ['OPD-001', 'OPD-008'] };
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const row = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
  prompt: z.string().trim().min(1).max(1000),
  expected: z.string().trim().min(1).max(200)
});
const draftSchema = z.strictObject({
  author: z.string().trim().min(1).max(80).describe('Public handle for attribution'),
  family: z.string().trim().min(1).max(100).describe('Name for this original exact-answer task family'),
  rationale: z.string().trim().min(1).max(600).describe('Why each input has a single checkable answer'),
  train: z.array(row).length(2), smoke: z.array(row).length(2)
});
function prepareDraft({ author, family, rationale, train, smoke }) {
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

export const evidence = {
  scope: 'Public project record at commit ' + evidenceCommit.slice(0, 7),
  observations: [
    { subject: 'Distributed work', type: 'simulated', result: 'Two simulated Ollama endpoints each handled part of a batch. The eight baseline tests passed.', source: evidenceSource },
    { subject: 'Proposed instructions', type: 'implemented', result: 'The scorer reports gains and regressions on held-out cases. A complete run with at least one gain and zero regressions qualifies a candidate for human review.', source: repo + '/blob/' + evidenceCommit + '/evolution.mjs' },
    { subject: 'Transfer to unfamiliar tasks', type: 'open experiment', result: 'The public baseline provides no measured gain across independent rounds at equal GPU time. OPD-007 describes the comparison.', source: repo + '/blob/' + evidenceCommit + '/EXPERIMENTS.md' },
    { subject: 'Real GPU scaling', type: 'open experiment', result: 'OPD-001 calls for a two-physical-GPU benchmark against each worker alone.', source: evidenceSource }
  ], latestTracker: board
};

export function registerTools(server) {
  function register(name, title, description, inputSchema, run) {
    server.registerTool(name, { title, description, inputSchema, annotations }, input => {
      try {
        const result = run(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: error.message }] };
      }
    });
  }
  register('find_tasks', 'Find OPDIS tasks', 'Find open research tasks for a phone contributor, a GPU operator, or a developer. Returns acceptance criteria and links to check current claims.',
    z.strictObject({ role: z.enum(['phone','gpu','developer','all']).default('all') }), ({ role }) => ({
      source: board, scope: 'Task tracker bundled with this release. Check the linked GitHub discussions before claiming work.',
      tasks: allTasks.filter(task => task.status.startsWith('Open') && (!roleTasks[role] || roleTasks[role].includes(task.id)))
        .filter(task => role !== 'developer' || !['OPD-001', 'OPD-011'].includes(task.id)) }));
  register('prepare_test_cases', 'Prepare test cases', 'Validate two original public training examples and two smoke cases. Returns a contribution draft for the user to review. This tool does not submit or store it.',
    draftSchema, prepareDraft);
  register('get_evidence', 'Read improvement evidence', 'Check what OPDIS has demonstrated, the kind of evidence, and which capability or GPU experiments remain open. Each result links to the public source.',
    z.strictObject({}), () => evidence);
}
