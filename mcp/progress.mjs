// SPDX-License-Identifier: MIT
export const repo = 'https://github.com/Haselton/Opdis-';
export const board = repo + '/blob/main/PROJECT_PROGRESS.md';
const publicTracker = 'https://api.github.com/repos/Haselton/Opdis-/contents/PROJECT_PROGRESS.md?ref=main';

export function parseTracker(markdown) {
  markdown = markdown.replaceAll('\r\n', '\n');
  const sections = markdown.split(/^## /m);
  const section = sections.find(part => part.startsWith('Contributor briefing\n'));
  const fields = new Map(section?.split(/^### /m).slice(1).map(part => {
    const end = part.indexOf('\n');
    return [part.slice(0, end), part.slice(end).trim()];
  }));
  const goal = fields.get('Mission');
  const demonstrated = fields.get('Demonstrated progress');
  const nextMilestones = fields.get('Next milestones');
  const tasks = markdown.split(/\r?\n/).filter(line => /^\| P\d \| OPD-\d+ \|/.test(line)).map(line => {
    const [priority, id, status, task, acceptance] = line.slice(1,-1).split('|').map(cell => cell.trim());
    if (!acceptance) throw new Error('Incomplete work-queue row: ' + id);
    return { id, priority, status, task, acceptance, discussion: repo + '/issues?q=' + encodeURIComponent(id) };
  });
  if (!goal || !demonstrated || !nextMilestones || !tasks.length) throw new Error('Incomplete OPDIS contributor briefing or work queue.');
  return { goal, demonstrated, nextMilestones, tasks };
}

// Only this public file is read. Contributor inputs never form part of the request.
export function publicProgressReader(bundled, request = fetch) {
  let lastGood, nextRead = 0, pending;
  async function refresh() {
    try {
      const response = await request(publicTracker, {
        headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'OPDIS-Contributors' },
        signal: AbortSignal.timeout(8000), redirect: 'error'
      });
      if (!response.ok) throw new Error('Tracker returned HTTP ' + response.status);
      const data = parseTracker(await response.text());
      lastGood = { ...data, source: board, scope: 'Public main branch tracker.', checkedAt: new Date().toISOString() };
      nextRead = Date.now() + 300000;
      return lastGood;
    } catch (error) {
      console.warn('Public OPDIS tracker refresh:', error.name, error.message);
      nextRead = Date.now() + 30000;
      return lastGood
        ? { ...lastGood, scope: 'Last successful GitHub read. Refresh unavailable.' }
        : { ...bundled, scope: 'Bundled release snapshot. GitHub refresh unavailable.' };
    }
  }
  let cached;
  return async () => {
    if (cached && Date.now() < nextRead) return cached;
    pending ??= refresh().then(result => { cached = result; return result; }).finally(() => { pending = undefined; });
    return pending;
  };
}

const starterIds = {
  vibecoder: ['OPD-015','OPD-002','OPD-013'],
  phone: ['OPD-011'],
  gpu: ['OPD-001','OPD-008'],
  developer: ['OPD-013','OPD-003','OPD-014'],
  all: ['OPD-015','OPD-001','OPD-011','OPD-013']
};
const firstSteps = {
  'OPD-015': 'Add a synthetic two-turn conversation to the public repo. Write the first check that the worker receives the earlier turn when the user asks a follow-up.',
  'OPD-002': 'Use a synthetic run summary to show how to compute prompts per second and how to represent missing timing data.',
  'OPD-013': 'Create a synthetic mission with one completed step, restart the coordinator in a test, and check which step runs next.',
  'OPD-011': 'Pick a small task with an exact answer. Draft two examples and two fresh checks with prepare_test_cases.',
  'OPD-001': 'Choose two machines their owners have offered and record the same workload on each alone. Use that baseline for the paired run.',
  'OPD-008': 'Follow the two-node setup guide from a clean checkout and record the first step that needs clarification.',
  'OPD-003': 'Start with a test in which a worker leaves after accepting a job.',
  'OPD-014': 'Create a synthetic units-conversion example and a regression check for a proposed repair.'
};
export function openTasks(tasks, role) {
  const open = tasks.filter(task => task.status.startsWith('Open'));
  if (role === 'phone' || role === 'gpu' || role === 'vibecoder')
    return starterIds[role].flatMap(id => open.filter(task => task.id === id));
  if (role === 'developer') return open.filter(task => !['OPD-001','OPD-011'].includes(task.id));
  return open;
}
export function briefing({tasks, ...progress}, role) {
  const eligible = openTasks(tasks, role);
  const task = starterIds[role].map(id => eligible.find(t => t.id === id)).find(Boolean) ?? eligible[0];
  return { ...progress, role, recommendedTask: task ? { ...task, firstStep: firstSteps[task.id] ?? task.task } : null,
    contribute: 'Check the linked discussion for an existing claim. Submit a small change or reproducible result with the task ID and the test you ran.',
    guide: repo + '/blob/main/CONTRIBUTING.md', whitePaper: repo + '/blob/main/docs/OPDIS-White-Paper.md' };
}
