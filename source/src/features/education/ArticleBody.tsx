import { useI18n } from '@/services/i18n';
import { ASSETS } from '@/assets';
import { PenRuler } from '@/components/product/Figures';
import { ArticleArt } from './ArticleArt';

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'fig'; name: string };

/** Lightweight article markup → blocks. See data/education.ts for the syntax. */
export function parseBody(body: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (para.length) { out.push({ type: 'p', text: para.join(' ') }); para = []; }
    if (list.length) { out.push({ type: 'ul', items: list }); list = []; }
  };
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const fig = /^\[fig:(\w+)\]$/.exec(line);
    if (line.startsWith('## ')) { flush(); out.push({ type: 'h2', text: line.slice(3) }); }
    else if (line.startsWith('> ')) { flush(); out.push({ type: 'quote', text: line.slice(2) }); }
    else if (line.startsWith('- ')) { if (para.length) flush(); list.push(line.slice(2)); }
    else if (fig) { flush(); out.push({ type: 'fig', name: fig[1] }); }
    else { if (list.length) flush(); para.push(line); }
  }
  flush();
  return out;
}

/** "Term — explanation" / "المصطلح: الشرح" → bold term. */
function Item({ text }: { text: string }) {
  const m = /^(.{2,46}?)( — |: )(.+)$/u.exec(text);
  if (!m) return <>{text}</>;
  return <><strong className="font-bold text-ink">{m[1]}</strong>{m[2]}{m[3]}</>;
}

function Figure({ name }: { name: string }) {
  const { t, L } = useI18n();
  const cap = (t.edu.figure as Record<string, string>)[name] ?? '';
  let art: React.ReactNode;
  if (name === 'pen') {
    art = <div className="rounded-[1.25rem] bg-aubergine px-6 py-10 sm:px-10"><PenRuler /></div>;
  } else if (name === 'cartridge') {
    art = (
      <div className="flex items-end justify-center gap-10 rounded-[1.25rem] bg-lavender-200 px-6 py-8">
        <img src={ASSETS.cartridge.src} alt={L(ASSETS.cartridge.alt)} width={ASSETS.cartridge.w} height={ASSETS.cartridge.h} loading="lazy" className="h-64 w-auto" />
      </div>
    );
  } else if (name === 'head') {
    art = (
      <div className="grid items-center gap-6 rounded-[1.25rem] bg-porcelain-200 px-6 py-8 sm:grid-cols-2">
        <img src={ASSETS.headArray.src} alt={L(ASSETS.headArray.alt)} width={ASSETS.headArray.w} height={ASSETS.headArray.h} loading="lazy" className="mx-auto h-auto w-44" />
        <img src={ASSETS.headSide.src} alt={L(ASSETS.headSide.alt)} width={ASSETS.headSide.w} height={ASSETS.headSide.h} loading="lazy" className="mx-auto h-auto w-60" />
      </div>
    );
  } else {
    art = <div className="aspect-[16/8] overflow-hidden rounded-[1.25rem]"><ArticleArt art={name === 'follicle' ? 'follicle' : 'topo'} seed={7} /></div>;
  }
  return (
    <figure className="!my-10">
      {art}
      {cap && <figcaption className="mt-3 text-[0.82rem] text-stone-700">{cap}</figcaption>}
    </figure>
  );
}

export function ArticleBody({ body }: { body: string }) {
  const { t } = useI18n();
  const blocks = parseBody(body);
  return (
    <div className="prose-dq">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2': return <h2 key={i}>{b.text}</h2>;
          case 'quote':
            return (
              <aside key={i} className="!my-9 border-s-2 border-brand bg-lavender-100 px-6 py-5">
                <p className="eyebrow text-brand">{t.edu.keyPoint}</p>
                <p className="!mt-2 !text-[1.1rem] font-semibold !leading-relaxed !text-ink">{b.text}</p>
              </aside>
            );
          case 'ul': return <ul key={i}>{b.items.map((it, j) => <li key={j}><Item text={it} /></li>)}</ul>;
          case 'fig': return <Figure key={i} name={b.name} />;
          default: return <p key={i} className={i === 0 ? '!text-[1.2rem] !leading-relaxed !text-ink' : undefined}>{b.text}</p>;
        }
      })}
    </div>
  );
}
