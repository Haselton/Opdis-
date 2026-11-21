// SPDX-License-Identifier: MIT
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { repo, registerTools } from './tools.mjs';
import page from './index.html';
import missionCard from './assets/opdis-mission.jpg';

const handler = createMcpHandler(() => {
  const server = new McpServer({ name: 'opdis-contributors', version: '0.1.0', websiteUrl: repo });
  registerTools(server);
  return server;
}, { responseMode: 'json' });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/opdis-mission.jpg' && ['GET', 'HEAD'].includes(request.method))
      return new Response(request.method === 'HEAD' ? null : missionCard, { headers: {
        'Content-Type': 'image/jpeg', 'Content-Length': String(missionCard.byteLength), 'Cache-Control': 'public, max-age=3600'
      } });
    if (url.pathname === '/draft.js' && ['GET', 'HEAD'].includes(request.method))
      return new Response(request.method === 'HEAD' ? null : OPDIS_DRAFT_JS, { headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'X-Content-Type-Options': 'nosniff' } });
    if (url.pathname === '/' && ['GET', 'HEAD'].includes(request.method))
      return new Response(request.method === 'HEAD' ? null : page, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    if (url.pathname !== '/mcp') return new Response('Not found', { status: 404 });
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return new Response('Origin not allowed', {status: 403});
    if (request.method !== 'POST') return new Response('Use an MCP client to POST to this endpoint.', {status: 405, headers: { Allow: 'POST' }});
    // Limit the wire payload before parsing. This covers clients sending chunked bodies as well.
    if (Number(request.headers.get('Content-Length')) > 32768) return new Response('Body too large', { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) return new Response('Body required', { status: 400 });
    const decoder = new TextDecoder();
    let length = 0, raw = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 32768) {
        await reader.cancel();
        return new Response('Body too large', { status: 413 });
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const headers = new Headers(request.headers);
    headers.delete('Content-Length');
    return handler.fetch(new Request(request.url, {method: 'POST', headers, body: raw, signal: request.signal}));
  }
};
