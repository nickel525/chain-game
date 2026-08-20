import { normalizeName } from "./match.js";
import { ANIMAL_DOMAIN } from "./traits.js";
import { BRAND_DOMAIN } from "./brandTraits.js";
import { CITY_DOMAIN } from "./cityTraits.js";

const DOMAINS = [ANIMAL_DOMAIN, BRAND_DOMAIN, CITY_DOMAIN].filter(
  (domain) => domain.dimensions.length >= 1
);

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pick(items, count) {
  return shuffle(items).slice(0, count);
}

function weightedDimensions(domain) {
  return domain.dimensions.flatMap((dimension) =>
    Array.from({ length: domain.weight?.(dimension) ?? 1 }, () => dimension)
  );
}

function bucketKey(name, dimension) {
  const hits = dimension.buckets.filter((bucket) => bucket.items.includes(name));
  return hits.length === 1 ? hits[0].three : "";
}

function oddOnes(labels, domain) {
  const odds = new Set();
  for (const dimension of domain.dimensions) {
    const keys = labels.map((name) => bucketKey(name, dimension));
    const counts = new Map();
    for (const key of keys) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (counts.size !== 2) continue;
    const entries = [...counts.entries()];
    const triple = entries.find(([, count]) => count === 3);
    const single = entries.find(([, count]) => count === 1);
    if (!triple || !single) continue;
    odds.add(labels[keys.indexOf(single[0])]);
  }
  return odds;
}

function isUniqueOdd(labels, odd, domain) {
  const odds = oddOnes(labels, domain);
  return odds.size === 1 && odds.has(odd);
}

function makePuzzle(items, odd, rule) {
  const cards = shuffle(
    items.map((label, index) => ({
      id: `${normalizeName(label)}-${index}`,
      label,
      odd: label === odd,
    }))
  );
  return { cards, oddId: cards.find((card) => card.odd).id, rule };
}

function fromDimension(domain, dimension) {
  const ready = dimension.buckets.filter((bucket) => bucket.items.length >= 3);
  if (ready.length < 2) return null;
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const [main, other] = pick(ready, 2);
    const ins = pick(main.items, 3);
    const odd = pick(
      other.items.filter((item) => !ins.includes(item)),
      1
    )[0];
    if (ins.length < 3 || !odd) continue;
    const labels = [...ins, odd];
    if (!isUniqueOdd(labels, odd, domain)) continue;
    return makePuzzle(labels, odd, `Three ${main.three}. One ${other.one}.`);
  }
  return null;
}

export function makeRound() {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const domain = pick(DOMAINS, 1)[0];
    const puzzle = fromDimension(domain, pick(weightedDimensions(domain), 1)[0]);
    if (puzzle?.cards.length === 4 && puzzle.oddId) return puzzle;
  }
  for (const domain of shuffle(DOMAINS)) {
    for (const dimension of shuffle(domain.dimensions)) {
      const puzzle = fromDimension(domain, dimension);
      if (puzzle?.cards.length === 4 && puzzle.oddId) return puzzle;
    }
  }
  return makeRound();
}
