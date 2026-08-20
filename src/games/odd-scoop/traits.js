import ANIMALS from "../../data/animals.js";
import { fill, firstMatch, isScientific, normalizeName } from "./match.js";

export const POOL = ANIMALS.filter((name) => {
  const normal = normalizeName(name);
  return normal.length >= 3 && normal.length <= 32 && !isScientific(name);
});

const KIND = [
  {
    three: "are birds",
    one: "is a bird",
    words: [
      "albatross", "auk", "bittern", "blackbird", "bluebird", "booby", "budgie",
      "bunting", "buzzard", "canary", "cardinal", "chickadee", "chicken",
      "cockatiel", "cockatoo", "condor", "cormorant", "crake", "crane", "crow",
      "cuckoo", "curlew", "darter", "dove", "duck", "eagle", "egret", "emu",
      "falcon", "finch", "flamingo", "gannet", "godwit", "goldfinch", "goose",
      "grebe", "grouse", "gull", "hawk", "heron", "hornbill", "hummingbird",
      "ibis", "jacana", "jay", "kestrel", "kingfisher", "kiwi", "kookaburra",
      "lark", "loon", "lovebird", "macaw", "magpie", "mallard", "nightingale",
      "nuthatch", "oriole", "osprey", "ostrich", "owl", "parakeet", "parrot",
      "pelican", "penguin", "pheasant", "pigeon", "plover", "ptarmigan",
      "puffin", "quail", "raven", "robin", "bee eater", "sandpiper", "snipe", "sparrow",
      "spoonbill", "starling", "stork", "swallow", "swan", "swift", "tanager",
      "tern", "thrush", "toucan", "turkey", "vulture", "wagtail", "warbler",
      "woodcock", "woodpecker", "wren", "cassowary", "rhea",
    ],
  },
  {
    three: "are dogs",
    one: "is a dog",
    words: [
      "akita", "basenji", "beagle", "boxer", "bulldog", "chihuahua", "chow",
      "collie", "coonhound", "corgi", "dachshund", "dalmatian", "dog",
      "foxhound", "greyhound", "hound", "husky", "labrador", "malamute",
      "mastiff", "pinscher", "pointer", "poodle", "pug", "retriever",
      "ridgeback", "rottweiler", "samoyed", "schnauzer", "setter", "sheepdog",
      "shepherd", "spaniel", "spitz", "terrier", "vizsla", "weimaraner",
      "whippet", "wolfhound",
    ],
  },
  {
    three: "live in the ocean",
    one: "lives in the ocean",
    words: [
      "albacore", "anchovy", "angelfish", "barracuda", "clam", "clownfish",
      "cod", "crab", "cuttlefish", "dolphin", "dugong", "flounder", "grouper",
      "haddock", "halibut", "jellyfish", "krill", "lobster", "mackerel",
      "manatee", "marlin", "nautilus", "octopus", "orca", "oyster", "porpoise",
      "pufferfish", "ray", "sea lion", "seahorse", "seal", "shark", "shrimp", "skate",
      "squid", "starfish", "stingray", "swordfish", "tuna", "walrus", "whale",
      "wrasse",
    ],
  },
  {
    three: "are primates",
    one: "is a primate",
    words: [
      "ape", "baboon", "bonobo", "capuchin", "chimpanzee", "gibbon", "gorilla",
      "howler", "langur", "lemur", "macaque", "marmoset", "monkey", "orangutan",
      "siamang", "tamarin", "tarsier",
    ],
  },
  {
    three: "are cats",
    one: "is a cat",
    words: [
      "bobcat", "caracal", "cat", "cheetah", "cougar", "jaguar", "leopard",
      "lion", "lynx", "ocelot", "panther", "puma", "serval", "tiger", "wildcat",
    ],
  },
  {
    three: "are reptiles",
    one: "is a reptile",
    words: [
      "adder", "agama", "alligator", "anole", "boa", "caiman", "chameleon",
      "cobra", "crocodile", "gecko", "iguana", "lizard", "mamba", "monitor",
      "python", "rattlesnake", "skink", "snake", "terrapin", "tortoise",
      "turtle", "viper",
    ],
  },
  {
    three: "are amphibians",
    one: "is an amphibian",
    words: ["axolotl", "frog", "newt", "salamander", "toad"],
  },
  {
    three: "are bugs",
    one: "is a bug",
    words: [
      "ant", "aphid", "bee", "beetle", "butterfly", "cockroach", "cricket",
      "damselfly", "dragonfly", "firefly", "flea", "grasshopper", "hornet",
      "ladybird", "ladybug", "locust", "mantis", "mosquito", "moth",
      "scorpion", "spider", "termite", "tick", "wasp",
    ],
  },
  {
    three: "are rodents",
    one: "is a rodent",
    words: [
      "agouti", "beaver", "capybara", "chinchilla", "chipmunk", "gerbil",
      "gopher", "guinea pig", "hamster", "lemming", "marmot", "mouse", "porcupine",
      "prairie dog", "rat", "squirrel", "vole",
    ],
  },
  {
    three: "are hoofed mammals",
    one: "is a hoofed mammal",
    words: [
      "addax", "alpaca", "antelope", "bison", "boar", "buffalo", "camel",
      "cattle", "deer", "donkey", "eland", "elephant", "elk", "gazelle",
      "gemsbok", "giraffe", "goat", "hippo", "hippopotamus", "hog", "horse",
      "ibex", "impala", "llama", "moose", "okapi", "oryx", "ox", "pig", "pony",
      "rhino", "rhinoceros", "sheep", "tapir", "wildebeest", "zebra",
    ],
  },
];

const REGION_PREFIX = [
  {
    three: "are from Africa",
    one: "is from Africa",
    words: [
      "african", "ethiopia", "ethiopian", "madagascar", "madagascan", "nile",
      "sahara", "saharan", "congo", "kenyan", "serengeti",
    ],
  },
  {
    three: "are from Asia",
    one: "is from Asia",
    words: [
      "asian", "borneo", "chinese", "himalayan", "indian", "japanese", "javan",
      "korean", "malayan", "mongolian", "siamese", "siberian", "sumatran",
      "tibetan",
    ],
  },
  {
    three: "are from the Americas",
    one: "is from the Americas",
    words: [
      "alaskan", "amazon", "amazonian", "american", "andean", "brazilian", "canadian",
      "chilean", "galapagos", "mexican", "peruvian",
    ],
  },
  {
    three: "are from Australia",
    one: "is from Australia",
    words: ["australian", "tasmanian"],
  },
  {
    three: "are from the Arctic or Antarctic",
    one: "is from the polar regions",
    words: ["adelie", "antarctic", "arctic", "polar"],
  },
  {
    three: "are from Europe",
    one: "is from Europe",
    words: ["alpine", "european", "iberian", "scandinavian"],
  },
];

const REGION_SPECIES = [
  {
    three: "are from Africa",
    one: "is from Africa",
    words: [
      "aardvark", "aardwolf", "chimpanzee", "eland", "gemsbok", "giraffe",
      "gorilla", "hippo", "hippopotamus", "hyena", "impala", "lemur",
      "meerkat", "okapi", "oryx", "secretary", "springbok", "wildebeest",
      "zebra",
    ],
  },
  {
    three: "are from Australia",
    one: "is from Australia",
    words: [
      "bandicoot", "bilby", "cassowary", "dingo", "echidna", "emu", "kangaroo",
      "koala", "kookaburra", "numbat", "platypus", "quokka", "wallaby", "wombat",
    ],
  },
  {
    three: "are from the Americas",
    one: "is from the Americas",
    words: [
      "alpaca", "armadillo", "bison", "capybara", "coati", "condor", "coyote",
      "llama", "opossum", "raccoon", "sloth", "turkey",
    ],
  },
];

const DIET = [
  {
    three: "are meat-eaters",
    one: "eats meat",
    words: [
      "alligator", "bobcat", "caiman", "caracal", "cheetah", "cobra", "cougar",
      "coyote", "crocodile", "eagle", "falcon", "hawk", "hyena", "jaguar",
      "kestrel", "leopard", "lion", "lynx", "mamba", "ocelot", "orca", "osprey",
      "owl", "panther", "puma", "python", "rattlesnake", "serval", "shark",
      "tiger", "viper", "vulture", "wolf", "wolverine",
    ],
  },
  {
    three: "are plant-eaters",
    one: "eats plants",
    words: [
      "addax", "alpaca", "antelope", "bison", "buffalo", "camel", "capybara",
      "cattle", "deer", "donkey", "elephant", "elk", "gazelle", "giraffe",
      "goat", "gorilla", "hippo", "hippopotamus", "horse", "ibex", "impala",
      "guinea pig", "kangaroo", "koala", "llama", "manatee", "moose", "okapi",
      "oryx", "panda", "panda bear", "pony", "rhino", "rhinoceros", "sheep", "sloth", "tapir",
      "wallaby", "wildebeest", "wombat", "zebra",
    ],
  },
  {
    three: "eat both plants and meat",
    one: "eats both plants and meat",
    words: [
      "baboon", "badger", "boar", "chimpanzee", "coati", "crow", "hedgehog",
      "hog", "opossum", "pig", "raccoon", "rat", "raven", "skunk",
    ],
  },
];

const HOME = [
  {
    three: "are desert animals",
    one: "is a desert animal",
    words: [
      "addax", "camel", "desert", "dromedary", "fennec", "gila", "jerboa",
      "meerkat", "oryx", "sahara", "saharan",
    ],
  },
  {
    three: "are polar animals",
    one: "is a polar animal",
    words: ["adelie", "antarctic", "arctic", "muskox", "polar", "walrus"],
  },
  {
    three: "are kept by people",
    one: "is kept by people",
    words: [
      "alpaca", "beagle", "budgie", "bulldog", "canary", "cattle", "chicken",
      "chihuahua", "collie", "corgi", "dalmatian", "donkey", "gerbil",
      "goat", "goldfish", "guinea pig", "hamster", "horse", "hound", "llama",
      "parakeet", "pig", "pony", "poodle", "retriever", "sheep", "shepherd",
      "spaniel", "terrier", "turkey",
    ],
  },
];

const EXTRA = [
  {
    three: "are venomous",
    one: "is venomous",
    words: [
      "adder", "cobra", "jellyfish", "mamba", "platypus", "rattlesnake",
      "scorpion", "stingray", "viper",
    ],
  },
  {
    three: "are flightless birds",
    one: "is a flightless bird",
    words: ["cassowary", "emu", "kiwi", "ostrich", "penguin", "rhea"],
  },
];

function fillRegion() {
  const prefixItems = REGION_PREFIX.map((bucket) => ({
    ...bucket,
    items: POOL.filter((name) => firstMatch(name, REGION_PREFIX) === bucket),
  }));
  const taken = new Set(prefixItems.flatMap((bucket) => bucket.items));
  const speciesItems = REGION_SPECIES.map((bucket) => ({
    ...bucket,
    items: POOL.filter(
      (name) => !taken.has(name) && firstMatch(name, REGION_SPECIES) === bucket
    ),
  }));
  const merged = new Map();
  for (const bucket of [...prefixItems, ...speciesItems]) {
    const current = merged.get(bucket.three) ?? { ...bucket, items: [] };
    current.items = [...current.items, ...bucket.items];
    merged.set(bucket.three, current);
  }
  return [...merged.values()].filter((bucket) => bucket.items.length >= 4);
}

export const DIMENSIONS = [
  { id: "kind", buckets: fill(POOL, KIND) },
  { id: "region", buckets: fillRegion() },
  { id: "diet", buckets: fill(POOL, DIET) },
  { id: "home", buckets: fill(POOL, HOME) },
  { id: "extra", buckets: fill(POOL, EXTRA) },
].filter((dimension) => dimension.buckets.length >= 2);

export const ANIMAL_DOMAIN = {
  id: "animals",
  label: "animals",
  dimensions: DIMENSIONS,
  weight(dimension) {
    return dimension.id === "diet" || dimension.id === "region" || dimension.id === "home"
      ? 2
      : 1;
  },
};
