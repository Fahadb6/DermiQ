// Folds the single-chunk build into one self-contained file: release/DermiQ-standalone.html
// It needs no server and no network: open it from disk, or in any HTML preview.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'node_modules/.dq-standalone');
let html = readFileSync(join(build, 'index.html'), 'utf8');

const cssTag = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/);
const jsTag = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/);
if (!cssTag || !jsTag) throw new Error('Unexpected build output: stylesheet or script tag not found');

// WOFF2 is supported everywhere this runs; drop the WOFF fallbacks to save space.
const css = readFileSync(join(build, cssTag[1]), 'utf8')
  .replace(/,\s*url\(["']?data:font\/woff;base64,[^)]*\)\s*format\(["']woff["']\)/g, '');
if (/<\/style/i.test(css)) throw new Error('Stylesheet contains a closing style tag');

let js = readFileSync(join(build, jsTag[1]), 'utf8');
const risky = (js.match(/<!--/g) || []).length;
if (risky) throw new Error(`Script contains ${risky} "<!--" sequence(s); cannot be inlined safely`);
js = js.replace(/<\/script/gi, '<\\/script');

const inline = {};
const demo = join(root, 'public/demo');
for (const f of readdirSync(demo).sort()) {
  if (f.endsWith('.webp')) inline[`demo/${f}`] = `data:image/webp;base64,${readFileSync(join(demo, f)).toString('base64')}`;
}
const favicon = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/favicon.svg')).toString('base64')}`;

html = html
  .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
  .replace(/href="\.\/favicon\.svg"/, () => `href="${favicon}"`)
  .replace(cssTag[0], () => `<style>${css}</style>`)
  .replace(jsTag[0], () => '')
  .replace('</head>', () => `<script>window.__DQ_INLINE__=${JSON.stringify(inline)};</script>\n  </head>`)
  .replace('</body>', () => `<script type="module">${js}</script>\n  </body>`);

if (/(src|href)="\.\//.test(html)) throw new Error('An external reference is left in the HTML');
mkdirSync(join(root, 'release'), { recursive: true });
const out = join(root, 'release/DermiQ-standalone.html');
writeFileSync(out, html);
console.log(`${out}  ${(Buffer.byteLength(html) / 1048576).toFixed(2)} MB  (${Object.keys(inline).length} demo images inlined)`);
