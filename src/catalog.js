import ANIMALS from "./data/animals.js";
import BRANDS from "./data/brands.js";
import CITIES from "./data/cities.js";
import POKEMON from "./data/pokemon.js";

export function normalizeName(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lastLetter(name) {
  const letters = normalizeName(name).match(/[a-z]/g);
  return letters ? letters[letters.length - 1] : "";
}

export function firstLetter(name) {
  const match = normalizeName(name).match(/[a-z]/);
  return match ? match[0] : "";
}

function titleCase(name) {
  return normalizeName(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function keysFor(name) {
  const normal = normalizeName(name);
  const compact = normal.replace(/ /g, "");
  return compact === normal ? [normal] : [normal, compact];
}

function buildIndex(items) {
  const byKey = new Map();
  for (const item of items) {
    for (const key of keysFor(item)) {
      byKey.set(key, item);
    }
  }
  return byKey;
}

function makeCategory({ id, label, singular, article, items }) {
  const index = buildIndex(items);
  return {
    id,
    label,
    singular,
    article,
    bestKey: `chain-best-${id}`,
    isValid(name) {
      return keysFor(name).some((key) => index.has(key));
    },
    matches(a, b) {
      const keys = new Set(keysFor(a));
      return keysFor(b).some((key) => keys.has(key));
    },
    display(name) {
      for (const key of keysFor(name)) {
        if (index.has(key)) return index.get(key);
      }
      return titleCase(name);
    },
    random() {
      return items[Math.floor(Math.random() * items.length)];
    },
  };
}

export const CATEGORIES = [
  makeCategory({
    id: "animals",
    label: "Animals",
    singular: "animal",
    article: "an",
    items: ANIMALS,
  }),
  makeCategory({
    id: "brands",
    label: "Brands",
    singular: "brand",
    article: "a",
    items: BRANDS,
  }),
  makeCategory({
    id: "cities",
    label: "Cities",
    singular: "city",
    article: "a",
    items: CITIES,
  }),
  makeCategory({
    id: "pokemon",
    label: "Pokémon",
    singular: "Pokémon",
    article: "a",
    items: POKEMON,
  }),
];

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}
