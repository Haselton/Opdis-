import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import worker from './dist/worker.mjs';

const port = Number(process.env.PORT || 8787);
const origin = 'http://127.0.0.1:' + port;
createServer(async (req, res) => {
  try {
    if (req.headers.host !== new URL(origin).host) { res.writeHead(403).end(); return; }
    const request = new Request(new URL(req.url, origin), { method: req.method,
      headers: req.headers, body: req.method === 'POST' ? Readable.toWeb(req) : undefined, duplex: 'half' });
    const response = await worker.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500).end('Request failed');
  }
}).listen(port, '127.0.0.1', () => console.log(origin + '/mcp'));
