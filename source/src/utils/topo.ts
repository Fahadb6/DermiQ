import { prng } from './misc';

/**
 * Procedural "scalp contour" lines — DermiQ's visual signature.
 * A smooth height field (a few gaussian rises) is traced with marching squares,
 * giving real, non-intersecting contour lines. Purely decorative: these are never
 * presented as a scan, a measurement or clinical data.
 */
export interface TopoOptions { cols?: number; rows?: number; levels?: number; w?: number; h?: number; bumps?: number }

const cache = new Map<string, string[]>();

export function topoPaths(seed: number, opts: TopoOptions = {}): string[] {
  const { cols = 64, rows = 40, levels = 11, w = 1600, h = 1000, bumps: nb = 6 } = opts;
  const key = [seed, cols, rows, levels, w, h, nb].join(':');
  const hit = cache.get(key);
  if (hit) return hit;

  const rnd = prng(seed * 9973 + 17);
  const aspect = w / h;
  const bumps = Array.from({ length: nb }, () => ({
    x: rnd(), y: rnd(), r: 0.14 + rnd() * 0.26, a: (rnd() < 0.22 ? -1 : 1) * (0.5 + rnd() * 0.8),
  }));
  const f = (u: number, v: number) => {
    let z = 0.16 * Math.sin(u * 3.1 + seed) * Math.cos(v * 2.3 + seed * 0.7);
    for (const b of bumps) {
      const dx = (u - b.x) * aspect, dy = v - b.y;
      z += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * b.r * b.r));
    }
    return z;
  };

  const grid: number[][] = [];
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= rows; j++) {
    const row: number[] = [];
    for (let i = 0; i <= cols; i++) {
      const z = f(i / cols, j / rows);
      row.push(z);
      if (z < lo) lo = z;
      if (z > hi) hi = z;
    }
    grid.push(row);
  }

  const sx = w / cols, sy = h / rows;
  const k = (x: number, y: number) => `${x.toFixed(4)},${y.toFixed(4)}`;
  const out: string[] = [];

  for (let n = 1; n <= levels; n++) {
    const level = lo + (hi - lo) * (n / (levels + 1));
    const segs: Array<[number, number, number, number]> = [];
    const t = (p: number, q: number) => (level - p) / (q - p);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i];
        const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const T: [number, number] = [i + t(a, b), j];
        const R: [number, number] = [i + 1, j + t(b, c)];
        const B: [number, number] = [i + t(d, c), j + 1];
        const L: [number, number] = [i, j + t(a, d)];
        const seg = (p: [number, number], q: [number, number]) => segs.push([p[0], p[1], q[0], q[1]]);
        switch (idx) {
          case 1: case 14: seg(L, B); break;
          case 2: case 13: seg(B, R); break;
          case 3: case 12: seg(L, R); break;
          case 4: case 11: seg(T, R); break;
          case 5: seg(L, T); seg(B, R); break;
          case 6: case 9: seg(T, B); break;
          case 7: case 8: seg(L, T); break;
          case 10: seg(L, B); seg(T, R); break;
        }
      }
    }
    // chain segments into polylines
    const ends = new Map<string, number[]>();
    segs.forEach((s, m) => {
      for (const kk of [k(s[0], s[1]), k(s[2], s[3])]) {
        const list = ends.get(kk);
        if (list) list.push(m); else ends.set(kk, [m]);
      }
    });
    const used = new Uint8Array(segs.length);
    for (let m = 0; m < segs.length; m++) {
      if (used[m]) continue;
      used[m] = 1;
      const pts: Array<[number, number]> = [[segs[m][0], segs[m][1]], [segs[m][2], segs[m][3]]];
      const extend = (forward: boolean) => {
        for (;;) {
          const tip = forward ? pts[pts.length - 1] : pts[0];
          const tk = k(tip[0], tip[1]);
          const next = (ends.get(tk) ?? []).find((q) => !used[q]);
          if (next === undefined) break;
          used[next] = 1;
          const s = segs[next];
          const other: [number, number] = k(s[0], s[1]) === tk ? [s[2], s[3]] : [s[0], s[1]];
          if (forward) pts.push(other); else pts.unshift(other);
        }
      };
      extend(true);
      extend(false);
      if (pts.length < 7) continue;
      const P = pts.map(([x, y]) => [x * sx, y * sy] as [number, number]);
      const closed = k(pts[0][0], pts[0][1]) === k(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      const r = (v: number) => v.toFixed(1);
      let dstr: string;
      if (closed) {
        const Q = P.slice(0, -1);
        const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        const m0 = mid(Q[Q.length - 1], Q[0]);
        dstr = `M${r(m0[0])} ${r(m0[1])}`;
        for (let q = 0; q < Q.length; q++) {
          const mm = mid(Q[q], Q[(q + 1) % Q.length]);
          dstr += `Q${r(Q[q][0])} ${r(Q[q][1])} ${r(mm[0])} ${r(mm[1])}`;
        }
        dstr += 'Z';
      } else {
        dstr = `M${r(P[0][0])} ${r(P[0][1])}`;
        for (let q = 1; q < P.length - 1; q++) {
          const mx = (P[q][0] + P[q + 1][0]) / 2, my = (P[q][1] + P[q + 1][1]) / 2;
          dstr += `Q${r(P[q][0])} ${r(P[q][1])} ${r(mx)} ${r(my)}`;
        }
        const last = P[P.length - 1];
        dstr += `L${r(last[0])} ${r(last[1])}`;
      }
      out.push(dstr);
    }
  }
  cache.set(key, out);
  return out;
}
