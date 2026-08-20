import { normalizeName } from "../../catalog.js";

export { normalizeName };

export function tokens(name) {
  return normalizeName(name).split(" ").filter(Boolean);
}

export function isScientific(name) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length < 2) return false;
  const latin = /(?:us|um|is|ae|ii|ensis|ata|atus|idae|ini)$/i;
  return parts.every((part) => /^[A-Z]/.test(part) && latin.test(part));
}

const COMPOUND = new Set([
  "beetle", "bird", "bug", "fish", "frog", "hound", "horse", "mouse",
  "shark", "snake", "toad", "turtle",
]);

const MODIFIER = new Set([
  "adelie", "african", "alaskan", "alpine", "amazon", "amazonian", "american",
  "andean", "antarctic", "arctic", "asian", "australian", "borneo", "brazilian",
  "canadian", "chilean", "chinese", "congo", "desert", "ethiopia", "ethiopian",
  "european", "galapagos", "himalayan", "iberian", "indian", "japanese", "javan",
  "kenyan", "korean", "madagascar", "madagascan", "malayan", "mexican",
  "mongolian", "nile", "peruvian", "polar", "sahara", "saharan", "scandinavian",
  "serengeti", "siamese", "siberian", "sumatran", "tasmanian", "tibetan",
]);

export function matchScore(name, word) {
  const normal = normalizeName(name);
  const needle = normalizeName(word);
  if (!needle) return 0;
  const parts = tokens(name);
  const head = parts[parts.length - 1] || "";

  if (normal === needle) return 10_000 + needle.length;

  if (needle.includes(" ")) {
    if (!normal.includes(needle)) return 0;
    return (normal.endsWith(needle) ? 3_000 : 2_000) + needle.length;
  }

  if (needle === "bee" && parts.includes("eater")) return 0;
  if (needle === "elephant" && parts.includes("shrew")) return 0;

  if (head === needle) return 1_000 + needle.length;
  if (COMPOUND.has(needle) && head.endsWith(needle)) return 800 + needle.length;
  if (MODIFIER.has(needle) && parts.includes(needle)) return 100 + needle.length;
  return 0;
}

export function hasWord(name, word) {
  return matchScore(name, word) > 0;
}

export function hasAny(name, words) {
  return words.some((word) => hasWord(name, word));
}

export function bestMatch(name, buckets) {
  let best = null;
  let bestScore = 0;
  for (const bucket of buckets) {
    for (const word of bucket.words) {
      const score = matchScore(name, word);
      if (score > bestScore) {
        bestScore = score;
        best = bucket;
      }
    }
  }
  return best;
}

export function firstMatch(name, buckets) {
  return bestMatch(name, buckets);
}

export function fill(pool, buckets) {
  return buckets
    .map((bucket) => ({
      ...bucket,
      items: pool.filter((name) => bestMatch(name, buckets) === bucket),
    }))
    .filter((bucket) => bucket.items.length >= 4);
}

export function fillNamed(pool, buckets) {
  const index = new Map();
  for (const name of pool) {
    const key = normalizeName(name);
    if (!index.has(key)) index.set(key, name);
  }
  return buckets
    .map((bucket) => ({
      ...bucket,
      items: [
        ...new Set(
          bucket.words
            .map((word) => index.get(normalizeName(word)))
            .filter(Boolean)
        ),
      ],
    }))
    .filter((bucket) => bucket.items.length >= 4);
}
