import WORDS from "./words.js";

export const MIN_WORD = 3;
const WORD_SET = new Set(WORDS);

export function isCompleteWord(stem) {
  return stem.length >= MIN_WORD && WORD_SET.has(stem);
}

export function wordsWith(stem) {
  return WORDS.filter((word) => word.includes(stem));
}

export function randomLetter() {
  const long = WORDS.filter((word) => word.length >= 8);
  const word = long[Math.floor(Math.random() * long.length)] ?? WORDS[0];
  return word[Math.floor(Math.random() * word.length)];
}
