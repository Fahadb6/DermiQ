/**
 * Lets the same code run in three places:
 *   1. on a web server            — hash routing, Web Storage;
 *   2. as a file opened from disk — hash routing, Web Storage;
 *   3. inside a sandboxed, network-less preview frame — in-memory routing and storage, and the browser
 *      silently drops form submissions there, so they are re-created below.
 */
declare global {
  interface Window {
    __DQ_INLINE__?: Record<string, string>;
  }
}

/** True when the document has no real URL to route with (about:srcdoc, blob:, data:). */
export const EMBEDDED: boolean = (() => {
  try {
    const p = window.location.protocol;
    return !(p === 'http:' || p === 'https:' || p === 'file:');
  } catch {
    return true;
  }
})();

/** Images folded into the self-contained build are looked up here; undefined everywhere else. */
export function inlineAsset(path: string): string | undefined {
  try {
    return window.__DQ_INLINE__?.[path];
  } catch {
    return undefined;
  }
}

export function installEnvironmentShims(): void {
  // In-page anchors such as the skip link. With hash routing a bare "#main" would be read as a route.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
    const href = a?.getAttribute('href') ?? '';
    if (!a || href.startsWith('#/')) return;
    e.preventDefault();
    const target = href.length > 1 ? document.getElementById(decodeURIComponent(href.slice(1))) : null;
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  });

  // A frame sandboxed without `allow-forms` never fires `submit`. Probe once; only when submissions are
  // blocked, turn submit-button clicks and Enter into a synthetic `submit` event so onSubmit handlers still run.
  let blocked = false;
  try {
    const probe = document.createElement('form');
    probe.hidden = true;
    let fired = false;
    probe.addEventListener('submit', (ev) => { fired = true; ev.preventDefault(); });
    (document.body ?? document.documentElement).appendChild(probe);
    if (typeof probe.requestSubmit === 'function') probe.requestSubmit(); else fired = true;
    probe.remove();
    blocked = !fired;
  } catch {
    blocked = false;
  }
  if (!blocked) return;

  const submit = (form: HTMLFormElement) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest?.('button, input[type="submit"]') as HTMLButtonElement | HTMLInputElement | null;
    if (!el || el.disabled || el.type !== 'submit' || !el.form) return;
    e.preventDefault();
    submit(el.form);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.isComposing || e.defaultPrevented) return;
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || !el.form) return;
    if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file'].includes(el.type)) return;
    e.preventDefault();
    submit(el.form);
  });
}
