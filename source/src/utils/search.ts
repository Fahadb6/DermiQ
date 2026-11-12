/** Bilingual search normalisation: Arabic orthographic variants + Latin case/diacritics. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')                 // Latin diacritics
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')     // Arabic tashkeel + tatweel
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // آ أ إ ٱ -> ا
    .replace(/\u0649/g, '\u064A')                    // ى -> ي
    .replace(/\u0629/g, '\u0647')                    // ة -> ه
    .replace(/\u0624/g, '\u0648')                    // ؤ -> و
    .replace(/\u0626/g, '\u064A')                    // ئ -> ي
    .replace(/[^\p{L}\p{N}\s.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every query token must appear in the haystack (AND search). Returns a simple relevance score. */
export function matchScore(query: string, fields: Array<{ text: string; weight: number }>): number {
  const q = normalize(query);
  if (!q) return 1;
  const tokens = q.split(' ').filter(Boolean);
  let score = 0;
  for (const tok of tokens) {
    let hit = 0;
    for (const f of fields) {
      if (normalize(f.text).includes(tok)) hit += f.weight;
    }
    if (hit === 0) return 0;
    score += hit;
  }
  return score;
}
