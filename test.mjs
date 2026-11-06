// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { runBatch } from './core.mjs';
import { compare, propose } from './evolution.mjs';
import { peerURL, ollamaAdapter } from './ollama.mjs';

const base = {id: 'base', instruction: 'Give a short answer.'};
const cases = ['a','b','c','d'].map(id => ({id, prompt: id, expected: id}));
const record = answer => ({answer, digest: 'd', vramBytes: 1024});
test('two peers share a job, preserve order and receive no answer key', async () => {
  const result = await runBatch(cases, ['p','q'], base, async (...args) => {
    assert.equal(args.length, 3);
    assert.equal(args[2], base.instruction);
    return record(args[1]);
  });
  assert.equal(result.solved, 4);
  assert.equal(result.activePeers, 2);
  assert.deepEqual(result.rows.map(r => r.id), ['a','b','c','d']);
});
test('a failed peer counts against the complete submitted suite', async () => {
  const result = await runBatch(cases, ['p','q'], base, async (peer, prompt) => {
    if (peer === 'p') throw new Error('offline');
    return record(prompt);
  });
  assert.equal(result.total, 4);
  assert.ok(result.errors > 0 && result.solved + result.errors === 4);
});
test('missing GPU evidence cannot count as a successful case', async () => {
  const r = await runBatch(cases, ['p'], base, async () => ({...record('a'), vramBytes: 0}));
  assert.equal(r.errors, 4);
});
test('overlapping suites and mixed digests are rejected', async () => {
  await assert.rejects(compare(cases, cases, base, base, ['p'], async () => record('a')), /overlap/);
  await assert.rejects(runBatch(cases, ['p','q'], base, async (p,x) => ({...record(x), digest:p})), /digests/);
});
test('a proposal sees training only and advances to human review after clean gains', async () => {
  const train = [{id:'t', prompt:'training example', expected:'x'}];
  const candidate = await propose(base, train, 'p', async (p, prompt) => {
    assert.ok(prompt.includes('training example'));
    return record('Reply with the input.');
  });
  const r = await compare(train, cases, base, candidate, ['p','q'],
    async (p, prompt, instruction) => record(instruction === base.instruction ? '-' : prompt));
  assert.ok(r.eligibleForReview);
  assert.equal(r.gains.length, 4);
});
test('a regression blocks review even with a net gain', async () => {
  const train = [{id:'t', prompt:'example', expected:'x'}];
  const candidate = { id:'candidate', instruction:'alternative' };
  const r = await compare(train, cases, base, candidate, ['p'],
    async (p,x,ins) => record((ins === 'alternative') === (x !== 'a') ? x : '-'));
  assert.deepEqual(r.regressions,['a']);
  assert.equal(r.eligibleForReview,false);
});
test('remote Ollama origins are rejected and local tunnels are accepted', () => {
  assert.throws(() => peerURL('http://203.0.113.12:11434'));
  assert.equal(peerURL('http://127.0.0.1:11435/'),'http://127.0.0.1:11435');
});
test('adapter checks model hash before inference and GPU residency afterwards', async () => {
  const digest = 'a'.repeat(64);
  const model = 'sample:latest';
  const paths = [];
  const request = async (url, options) => {
    const path = new URL(url).pathname;
    paths.push(path);
    if (path === '/api/generate') {
      const b = JSON.parse(options.body);
      assert.equal(b.stream,false);
      assert.equal(b.prompt,'p');
      return {ok:true, json:async () => ({done:true, response:'x'})};
    }
    return {ok:true, json:async () => ({models:[{name:model,digest,size_vram:4096}]})};
  };
  const infer = ollamaAdapter(model,digest,request);
  assert.equal((await infer('http://127.0.0.1:11434','p','s')).vramBytes,4096);
  assert.deepEqual(paths,['/api/tags','/api/generate','/api/ps']);
});
