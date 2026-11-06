// SPDX-License-Identifier: MIT
export function peerURL(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('Use a loopback Ollama URL or a local SSH tunnel for each peer.');
  return url.origin;
}

export function ollamaAdapter(model, expectedDigest, request = fetch) {
  if (!model || !/^[a-f0-9]{64}$/i.test(expectedDigest))
    throw new Error('Set an exact model tag and the 64-character SHA-256 digest.');
  async function json(peer, path, body) {
    const options = { redirect: 'error', signal: AbortSignal.timeout(120000) };
    if (body) Object.assign(options, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body) });
    const response = await request(peer + path, options);
    if (!response.ok) throw new Error(path + ' returned HTTP ' + response.status);
    return response.json();
  }
  function matching(list, name) {
    return list.models?.find(entry => (entry.name === name || entry.model === name) &&
      entry.digest === expectedDigest);
  }
  return async (raw, prompt, instruction) => {
    const peer = peerURL(raw);
    if (!matching(await json(peer, '/api/tags'), model))
      throw new Error('The requested tag and digest must already exist on this peer.');
    const result = await json(peer, '/api/generate', { model, prompt, system: instruction,
      stream: false, keep_alive: '5m', options: { temperature: 0, seed: 23, num_predict: 96 } });
    if (result.done !== true || typeof result.response !== 'string') throw new Error('Incomplete generation.');
    const loaded = matching(await json(peer, '/api/ps'), model);
    if (!loaded || !(loaded.size_vram > 0)) throw new Error('No matching model in GPU memory.');
    return { answer: result.response, digest: loaded.digest, vramBytes: loaded.size_vram,
      evalTokens: result.eval_count || 0 };
  };
}
