import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "games", "stretch");
const SOURCE =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt";
const MIN_LEN = 3;
const MAX_LEN = 16;
const LIMIT = 25000;
const SKIP = new Set([
  "anal",
  "anus",
  "arse",
  "ass",
  "balls",
  "bastard",
  "bitch",
  "bloody",
  "blowjob",
  "bollocks",
  "boob",
  "boobs",
  "cock",
  "crap",
  "cunt",
  "damn",
  "dick",
  "dildo",
  "dyke",
  "fag",
  "faggot",
  "fuck",
  "fucking",
  "goddamn",
  "homo",
  "horny",
  "jizz",
  "kike",
  "labia",
  "nazi",
  "nigga",
  "nigger",
  "penis",
  "piss",
  "poop",
  "porn",
  "pussy",
  "queer",
  "rape",
  "raped",
  "sex",
  "sexy",
  "shit",
  "slut",
  "spic",
  "tits",
  "vagina",
  "wank",
  "whore",
]);

const res = await fetch(SOURCE);
if (!res.ok) {
  throw new Error(`Failed to fetch word list: ${res.status}`);
}

const words = [];
const seen = new Set();
for (const line of (await res.text()).split(/\r?\n/)) {
  const word = line.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (!/^[a-z]+$/.test(word)) continue;
  if (word.length < MIN_LEN || word.length > MAX_LEN) continue;
  if (SKIP.has(word)) continue;
  if (seen.has(word)) continue;
  seen.add(word);
  words.push(word);
  if (words.length >= LIMIT) break;
}

mkdirSync(outDir, { recursive: true });
const body = words.map((word) => `  ${JSON.stringify(word)},`).join("\n");
writeFileSync(join(outDir, "words.js"), `export default [\n${body}\n];\n`);
console.log(`Wrote ${words.length} words`);
