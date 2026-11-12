#!/usr/bin/env node
// A small local stand-in for a static host that follows Netlify's rules, used to try a folder before uploading it.
// It is an approximation written from Netlify's documented behaviour, not Netlify itself:
//   1. forced rules in _redirects ("302!") win over files;
//   2. then real files (a folder answers with its index.html; "/page" also finds "page.html");
//   3. then the remaining _redirects rules, in order;
//   4. then 404.html, or — like Netlify — a plain "Page not found".
// usage: node qa/netlify-sim.mjs <folder> [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

export function parseRedirects(text) {
  return text.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => {
    const [from, to, code = '301'] = l.split(/\s+/);
    return { from, to, status: parseInt(code, 10), force: code.endsWith('!') };
  });
}
const match = (rule, path) => {
  if (rule.from.endsWith('/*')) { const base = rule.from.slice(0, -2); return path === base || path.startsWith(base + '/') ? path.slice(base.length + 1) : null; }
  return rule.from === path || rule.from === path.replace(/\/$/, '') ? '' : null;
};

export function startSim(folder, port = 0) {
  const root = resolve(folder);
  const rules = existsSync(join(root, '_redirects')) ? parseRedirects(readFileSync(join(root, '_redirects'), 'utf8')) : [];
  const fileFor = async (path) => {
    const file = normalize(join(root, path));
    if (file !== root && !file.startsWith(root + sep)) return null;
    const info = await stat(file).catch(() => null);
    if (info?.isFile()) return file;
    if (info?.isDirectory()) { const idx = join(file, 'index.html'); return (await stat(idx).catch(() => null))?.isFile() ? (path.endsWith('/') ? idx : { slash: true }) : null; }
    if (!extname(path) && (await stat(file + '.html').catch(() => null))?.isFile()) return file + '.html';
    return null;
  };
  const send = async (res, status, file) => res.writeHead(status, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(await readFile(file));
  const apply = async (res, rule, splat) => {
    const to = rule.to.replace(':splat', splat);
    if (rule.status === 200) { const f = await fileFor(to); if (f && typeof f === 'string') return send(res, 200, f), true; return false; }
    res.writeHead(rule.status, { Location: to }).end(); return true;
  };
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path === '/_redirects') { res.writeHead(404).end('Not found'); return; }            // never served as a file
      for (const r of rules.filter((x) => x.force)) { const s = match(r, path); if (s !== null && await apply(res, r, s)) return; }
      const f = await fileFor(path);
      if (f && typeof f === 'string') return void await send(res, 200, f);
      if (f?.slash) { res.writeHead(301, { Location: path + '/' }).end(); return; }
      for (const r of rules.filter((x) => !x.force)) { const s = match(r, path); if (s !== null && await apply(res, r, s)) return; }
      const nf = join(root, '404.html');
      if (existsSync(nf)) return void await send(res, 404, nf);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end('<h1>Page not found</h1><p>Looks like you’ve followed a broken link or entered a URL that doesn’t exist on this site.</p>');
    } catch (e) { res.writeHead(500).end(String(e)); }
  });
  return new Promise((ok) => server.listen(port, '0.0.0.0', () => ok({ server, port: server.address().port, rules: rules.length })));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [folder, port = '4173'] = process.argv.slice(2);
  if (!folder) { console.error('usage: node qa/netlify-sim.mjs <folder> [port]'); process.exit(2); }
  const s = await startSim(folder, Number(port));
  console.log(`Serving ${resolve(folder)} the way a static host would → http://localhost:${s.port}  (${s.rules} redirect rules)`);
}
