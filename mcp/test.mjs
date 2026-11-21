import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import app from './dist/worker.mjs';
import { readFile } from 'node:fs/promises';
import { briefing, parseTracker, publicProgressReader } from './progress.mjs';

const endpoint = new URL('http://127.0.0.1:8787/mcp');
const localFetch = (url, init) => app.fetch(new Request(url, init));
const client = new Client({ name: 'opdis-integration-test', version: '1' });
const call = (name, args) => client.callTool({ name, arguments: args });
const payload = response => JSON.parse(response.content[0].text);
const item = n => ({ id: 'letter-' + n, prompt: 'Repeat letter ' + n, expected: n });
const draft = { author: 'example', family: 'letters', rationale: 'The final letter is the exact answer.',
  train: [item('a'), item('b')], smoke: [item('c'), item('d')] };

test.before(async () => client.connect(new StreamableHTTPClientTransport(endpoint, { fetch: localFetch })));
test.after(async () => client.close());
test('an MCP client discovers all contributor tools', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(t => t.name).sort(), ['find_tasks', 'get_evidence', 'get_project_briefing', 'prepare_test_cases']);
  assert.ok(tools.every(t => t.annotations.readOnlyHint && t.inputSchema.type === 'object'));
});
test('a new contributor gets the mission, evidence, next milestones and a small open task', async () => {
  assert.match(client.getInstructions(), /get_project_briefing/);
  const first = payload(await call('get_project_briefing', {}));
  assert.match(first.goal, /decentralized superintelligence/);
  assert.match(first.demonstrated, /simulated/i);
  assert.match(first.nextMilestones, /equal compute/i);
  assert.equal(first.recommendedTask.id, 'OPD-015');
  assert.match(first.recommendedTask.firstStep, /two-turn/);
  assert.match(first.recommendedTask.acceptance, /reopening/);
  const gpu = payload(await call('get_project_briefing', {role: 'gpu'}));
  assert.equal(gpu.recommendedTask.id, 'OPD-001');
  const phone = payload(await call('find_tasks', {role: 'phone'}));
  assert.equal(phone.briefing.recommendedTask.id, 'OPD-011');
});

test('hosted onboarding uses updated task status and labels offline fallback', async () => {
  const source = await readFile(new URL('../PROJECT_PROGRESS.md', import.meta.url), 'utf8');
  const bundled = parseTracker(source);
  const changed = source.replace('OPD-015 | Open', 'OPD-015 | Done');
  let reads = 0;
  const latest = publicProgressReader(bundled, async url => {
    reads++;
    assert.equal(url, 'https://api.github.com/repos/Haselton/Opdis-/contents/PROJECT_PROGRESS.md?ref=main');
    return new Response(changed);
  });
  const [a,b] = await Promise.all([latest(),latest()]);
  assert.equal(a,b);
  assert.equal(reads,1);
  assert.equal(briefing(a,'vibecoder').recommendedTask.id, 'OPD-002');
  assert.equal(b.tasks.find(t => t.id === 'OPD-015').status, 'Done');
  const offline = publicProgressReader(bundled, async () => new Response('unavailable'));
  assert.match((await offline()).scope, /Bundled release snapshot/);
});
test('finds phone and GPU tasks with acceptance evidence', async () => {
  const phone = payload(await call('find_tasks', {role: 'phone'}));
  assert.equal(phone.tasks[0].id,'OPD-011');
  assert.match(phone.tasks[0].acceptance,/two training/i);
  assert.ok(payload(await call('find_tasks', {role:'gpu'})).tasks.some(x => x.id === 'OPD-001'));
});
test('validates a draft without publishing and rejects cross-suite overlap', async () => {
  const valid = payload(await call('prepare_test_cases', draft));
  assert.deepEqual(valid.files['smoke.json'],draft.smoke);
  assert.equal(valid.status,'draft');
  const duplicate = structuredClone(draft);
  duplicate.smoke[0].prompt = ' REPEAT  LETTER A ';
  assert.ok((await call('prepare_test_cases', duplicate)).isError);
  assert.ok((await call('prepare_test_cases', {...draft, train:[]})).isError);
});
test('evidence separates simulated results and open research', async () => {
  const report = payload(await call('get_evidence', {}));
  assert.ok(report.observations.some(row => row.type === 'simulated'));
  assert.ok(report.observations.some(row => row.subject === 'Transfer to unfamiliar tasks' && row.type === 'open experiment'));
  assert.ok(report.observations.every(row => row.source.startsWith('https://github.com/Haselton/Opdis-/')));
});
test('modern protocol discovers this server', async () => {
  const version='2026-07-28', method='server/discover';
  const response=await localFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',
    Accept:'application/json, text/event-stream','Mcp-Method':method,'MCP-Protocol-Version':version},
    body:JSON.stringify({jsonrpc:'2.0',id:4,method,params:{_meta:{'io.modelcontextprotocol/protocolVersion':version,
      'io.modelcontextprotocol/clientInfo':{name:'opdis-test',version:'1'},'io.modelcontextprotocol/clientCapabilities':{}}}})});
  const data=await response.json();
  assert.equal(response.status,200,JSON.stringify(data));
  assert.ok(data.result.supportedVersions.includes(version));
});
test('landing page, request boundaries and method restrictions', async () => {
  const page = await (await localFetch(new URL('/', endpoint))).text();
  assert.match(page, /<h1>Building an open superintelligence for everyone<\/h1>/);
  assert.match(page, /href="#draft"/);
  assert.match(page, /property="og:image" content="[^"]+\/opdis-mission\.jpg"/);
  const image = await localFetch(new URL('/opdis-mission.jpg', endpoint));
  assert.equal(image.headers.get('Content-Type'), 'image/jpeg');
  assert.deepEqual([...new Uint8Array(await image.arrayBuffer()).slice(0, 3)], [255, 216, 255]);
  assert.equal((await localFetch(endpoint)).status,405);
  assert.equal((await localFetch(endpoint,{ method:'POST',headers:{ Origin:'https://other.example' }})).status,403);
  assert.equal((await localFetch(endpoint,{ method:'POST',body:'a'.repeat(33000)})).status,413);
});
