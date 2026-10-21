/* Zero-dependency static server with byte-range support (needed by audio). */
import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};

export function createStaticServer(root = process.cwd()) {
  const rootDir = path.resolve(root);

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        res.writeHead(400).end('Bad request');
        return;
      }
      if (pathname.endsWith('/')) pathname += 'index.html';

      let file = path.resolve(rootDir, '.' + pathname);
      if (file !== rootDir && !file.startsWith(rootDir + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      let stat;
      try {
        stat = await fs.stat(file);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
        return;
      }
      if (stat.isDirectory()) {
        file = path.join(file, 'index.html');
        try { stat = await fs.stat(file); } catch {
          res.writeHead(404).end('Not found');
          return;
        }
      }

      const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
      const baseHeaders = {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes'
      };

      const range = req.headers.range;
      if (range) {
        const m = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!m || (!m[1] && !m[2])) {
          res.writeHead(416, { ...baseHeaders, 'Content-Range': `bytes */${stat.size}` }).end();
          return;
        }
        let start = m[1] ? Number(m[1]) : stat.size - Number(m[2]);
        let end = m[1] && m[2] ? Number(m[2]) : stat.size - 1;
        start = Math.max(0, Math.min(start, stat.size - 1));
        end = Math.max(start, Math.min(end, stat.size - 1));
        res.writeHead(206, {
          ...baseHeaders,
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': end - start + 1
        });
        if (req.method === 'HEAD') return res.end();
        createReadStream(file, { start, end }).pipe(res);
        return;
      }

      res.writeHead(200, { ...baseHeaders, 'Content-Length': stat.size });
      if (req.method === 'HEAD') return res.end();
      createReadStream(file).pipe(res);
    } catch (err) {
      console.error('[serve]', err);
      if (!res.headersSent) res.writeHead(500);
      res.end('Internal error');
    }
  });
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const args = process.argv.slice(2);
  const portFlag = args.indexOf('--port');
  const port = Number(portFlag >= 0 ? args[portFlag + 1] : (process.env.PORT || 8000));
  const root = path.resolve(args.find((a, i) => !a.startsWith('--') && (portFlag < 0 || i !== portFlag + 1)) || process.cwd());
  const server = createStaticServer(root);
  server.listen(port, '127.0.0.1', () => {
    console.log(`灯塔不眠 · dev server`);
    console.log(`  root: ${root}`);
    console.log(`  url:  http://127.0.0.1:${port}`);
  });
  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : err);
    process.exit(1);
  });
}
