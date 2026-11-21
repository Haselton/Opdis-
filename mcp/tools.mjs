// SPDX-License-Identifier: MIT
import { z } from 'zod';
import { draftSchema, prepareDraft } from './draft.mjs';
import tracker from '../PROJECT_PROGRESS.md';

import { repo, board, parseTracker, briefing, openTasks } from './progress.mjs';
export { repo };
export const bundledProgress = { ...parseTracker(tracker), source: board, scope: 'Tracker bundled with this checkout or release.' };
const roles = z.enum(['phone','gpu','developer','vibecoder','all']);
const evidenceCommit = '3eb84253bfb2286c7324c734f91611958e749ed4';
const evidenceSource = repo + '/blob/' + evidenceCommit + '/PROJECT_PROGRESS.md';
const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
export const evidence = {
  scope: 'Public project record at commit ' + evidenceCommit.slice(0, 7),
  observations: [
    { subject: 'Distributed work', type: 'simulated', result: 'Two simulated Ollama endpoints each handled part of a batch. The eight baseline tests passed.', source: evidenceSource },
    { subject: 'Proposed instructions', type: 'implemented', result: 'The scorer reports gains and regressions on held-out cases. A complete run with at least one gain and zero regressions qualifies a candidate for human review.', source: repo + '/blob/' + evidenceCommit + '/evolution.mjs' },
    { subject: 'Transfer to unfamiliar tasks', type: 'open experiment', result: 'The public baseline provides no measured gain across independent rounds at equal GPU time. OPD-007 describes the comparison.', source: repo + '/blob/' + evidenceCommit + '/EXPERIMENTS.md' },
    { subject: 'Real GPU scaling', type: 'open experiment', result: 'OPD-001 calls for a two-physical-GPU benchmark against each worker alone.', source: evidenceSource }
  ], latestTracker: board
};

export function registerTools(server, readProgress) {
  function register(name, title, description, inputSchema, run) {
    server.registerTool(name, { title, description, inputSchema, annotations }, async input => {
      try {
        const result = await run(input);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: error.message }] };
      }
    });
  }
  register('get_project_briefing', 'Start contributing to OPDIS', 'Start here to understand the mission, demonstrated progress, next milestones and one open task matched to your equipment or coding assistant.',
    z.strictObject({ role: roles.default('vibecoder') }), async ({role}) => briefing(await readProgress(), role));
  register('find_tasks', 'Find OPDIS tasks', 'Find open research tasks for phone, GPU, coding-assistant or developer contributors. Includes the project briefing, acceptance criteria and discussion links.',
    z.strictObject({ role: roles.default('all') }), async ({role}) => {
      const progress = await readProgress();
      return { source: board, scope: progress.scope, briefing: briefing(progress, role), tasks: openTasks(progress.tasks, role) };
    });
  register('prepare_test_cases', 'Prepare test cases', 'Validate two original public training examples and two smoke cases. Returns a contribution draft for the user to review. This tool does not submit or store it.',
    draftSchema, prepareDraft);
  register('get_evidence', 'Read improvement evidence', 'Check what OPDIS has demonstrated, the kind of evidence, and which capability or GPU experiments remain open. Each result links to the public source.',
    z.strictObject({}), () => evidence);
}
