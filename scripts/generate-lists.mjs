import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "data");

function titleCase(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return word;
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function cleanBrand(name) {
  return String(name)
    .replace(
      /\s*,?\s*(incorporated|inc\.?|corporation|corp\.?|company|co\.|ltd\.?|llc|plc)\s*$/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

const ANIMAL_SKIP = new Set([
  "ass",
  "bleu",
  "devil",
  "dik",
  "gazer",
  "human",
  "monster",
  "neanderthal",
  "pie",
  "racer",
  "constrictor",
  "gazer",
  "wambenger",
  "cuis",
  "toddy cat",
]);

function uniqueSorted(items) {
  const seen = new Map();
  for (const item of items) {
    const cleaned = String(item || "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length < 2) continue;
    if (!/[a-z]/i.test(cleaned)) continue;
    const key = cleaned
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (!key || key.length < 2) continue;
    if (!seen.has(key)) seen.set(key, cleaned);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

function writeList(filename, items) {
  const list = uniqueSorted(items);
  const body = list.map((item) => `  ${JSON.stringify(item)},`).join("\n");
  writeFileSync(join(outDir, filename), `export default [\n${body}\n];\n`);
  return list.length;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

const POKEMON_DISPLAY = {
  "nidoran-f": "Nidoran Female",
  "nidoran-m": "Nidoran Male",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "type-null": "Type: Null",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  "tapu-koko": "Tapu Koko",
  "tapu-lele": "Tapu Lele",
  "tapu-bulu": "Tapu Bulu",
  "tapu-fini": "Tapu Fini",
  flabebe: "Flabebe",
  "wo-chien": "Wo-Chien",
  "chien-pao": "Chien-Pao",
  "ting-lu": "Ting-Lu",
  "chi-yu": "Chi-Yu",
};

function displayPokemon(slug) {
  if (POKEMON_DISPLAY[slug]) return POKEMON_DISPLAY[slug];
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isJunkAnimal(name) {
  const trimmed = name.trim();
  if (/^[A-Z]top$/i.test(trimmed)) return true;
  if (/\d/.test(trimmed)) return true;
  if (/\./.test(trimmed)) return true;
  if (trimmed.split(" ").length > 4) return true;
  if (
    /^[A-Z][a-z]+ [a-z]+( [a-z]+)?$/.test(trimmed) &&
    /\b(planci|sp|spp|[a-z]{5,}us|[a-z]+ensis|[a-z]+ii)\b/.test(trimmed)
  ) {
    return true;
  }
  return false;
}

const EXTRA_ANIMALS = [
  "Addax", "Agama", "Albacore", "Auk", "Auklet", "Bandicoot", "Barbet",
  "Barramundi", "Basilisk", "Basking Shark", "Binturong", "Blesbok",
  "Bluebird", "Bluejay", "Booby", "Bustard", "Buzzard", "Caiman",
  "Caracal", "Cassowary", "Catfish", "Chameleon", "Chamois", "Chickadee",
  "Chough", "Cicada", "Clam", "Coati", "Cobra", "Cockroach", "Cod",
  "Condor", "Coot", "Copperhead", "Cormorant", "Cottonmouth", "Cougar",
  "Coypu", "Crane Fly", "Crayfish", "Cuttlefish", "Damselfly", "Dhole",
  "Dik-dik", "Discus", "Dodo", "Dormouse", "Dovekie", "Drongo", "Duiker",
  "Dunnock", "Earwig", "Egret", "Eider", "Eland", "Electric Eel",
  "Firefly", "Flounder", "Flying Fox", "Flying Squirrel", "Fossa",
  "Frigatebird", "Fulmar", "Galah", "Gannet", "Gaur", "Gazelle",
  "Gerenuk", "Gharial", "Gibbon", "Gila Monster", "Glowworm", "Gnu",
  "Godwit", "Goldfinch", "Gopher", "Grackle", "Grebe", "Grouper",
  "Guanaco", "Guinea Pig", "Gull", "Guppy", "Haddock", "Halibut",
  "Hammerhead", "Hartebeest", "Hermit Crab", "Herring", "Hoopoe",
  "Hornbill", "Horseshoe Crab", "Howler Monkey", "Hyrax", "Ibex",
  "Impala", "Indri", "Jacana", "Jackrabbit", "Jaguarundi", "Jay",
  "Jerboa", "Kakapo", "Kestrel", "Kinkajou", "Kite", "Kiwi", "Klipspringer",
  "Koel", "Kookaburra", "Kori Bustard", "Krill", "Kudu", "Lamprey",
  "Langur", "Lapwing", "Lark", "Leafcutter Ant", "Leech", "Liger",
  "Limpet", "Lingcod", "Lionfish", "Loon", "Lorikeet", "Loris",
  "Lungfish", "Lyrebird", "Macaque", "Mackerel", "Magpie", "Mallard",
  "Mamba", "Mandrill", "Manta Ray", "Marmoset", "Marmot", "Marten",
  "Mayfly", "Meerkat", "Millipede", "Mink", "Minnow", "Mockingbird",
  "Monitor Lizard", "Moorhen", "Moray Eel", "Mouflon", "Mudskipper",
  "Musk Ox", "Mynah", "Narwhal", "Nautilus", "Needlefish", "Nightjar",
  "Nilgai", "Numbat", "Nuthatch", "Nyala", "Ocelot", "Okapi", "Olm",
  "Onager", "Oriole", "Oryx", "Osprey", "Oystercatcher", "Pangolin",
  "Parakeet", "Partridge", "Peccary", "Perch", "Petrel", "Phalarope",
  "Pheasant", "Pika", "Pilot Whale", "Pipefish", "Piranha", "Plover",
  "Ptarmigan", "Pufferfish", "Quetzal", "Quokka", "Rail", "Raven",
  "Red Panda", "Reedbuck", "Rhea", "Right Whale", "Roadrunner",
  "Rook", "Sable", "Saiga", "Sandpiper", "Sardine", "Sawfish",
  "Secretary Bird", "Serval", "Shearwater", "Shoebill", "Shrike",
  "Sidewinder", "Sifaka", "Silkworm", "Skimmer", "Skua", "Sloth Bear",
  "Snapper", "Snipe", "Snow Leopard", "Sole", "Sparrowhawk", "Spoonbill",
  "Springbok", "Starling", "Stick Insect", "Stingray", "Stoat", "Stork",
  "Sturgeon", "Sugar Glider", "Sunbird", "Sunfish", "Swallow",
  "Swordfish", "Takin", "Tamarin", "Tanager", "Tapir", "Tarpon",
  "Tarsier", "Tasmanian Devil", "Tern", "Tetra", "Thrush", "Tiglon",
  "Titmouse", "Toadfish", "Tody", "Trogon", "Trout", "Tuna", "Turaco",
  "Urial", "Vicuna", "Vicuña", "Vole", "Wagtail", "Wallaroo", "Walleye",
  "Warbler", "Warthog", "Waterbuck", "Waxwing", "Weaver", "Weka",
  "Wildebeest", "Wolverine", "Wrasse", "Wren", "Xerus", "Yellowtail",
  "Zorilla", "Zebrafish", "Aardwolf", "Addax", "Anole", "Argali",
  "Axolotl", "Aye-aye", "Babirusa", "Banteng", "Barbary Ape",
  "Beluga", "Blackbuck", "Bongo", "Bonobo", "Capybara", "Caribou",
  "Chinchilla", "Coelacanth", "Cuscus", "Dugong", "Echidna",
  "Fennec Fox", "Fisher", "Gelada", "Gerenuk", "Giant Squid",
  "Gundi", "Hamerkop", "Harpy Eagle", "Honey Badger", "Ibis",
  "Jackdaw", "Jerboa", "Kakapo", "Kea", "Kiwi", "Lammergeier",
  "Lechwe", "Manakin", "Manatee", "Manta", "Margay", "Markhor",
  "Mink", "Okapi", "Olm", "Olingo", "Pangolin", "Pika", "Quoll",
  "Saola", "Sitatunga", "Slow Loris", "Solenodon", "Takahe",
  "Tenrec", "Uakari", "Wombat", "Yak", "Zebu",
];

const EXTRA_BRANDS = [
  "3M", "7-Eleven", "Acer", "Activision", "Adobe", "Aetna", "Airbnb",
  "Airbus", "Air Canada", "Air France", "Alibaba", "Allstate", "Amazon",
  "American Airlines", "American Eagle", "American Express", "Android",
  "Anheuser-Busch", "Anthropologie", "AOL", "Apple", "Arby's", "Asics",
  "Asus", "AT&T", "Atari", "Audi", "Autodesk", "Aveda", "Avis", "Avon",
  "Baidu", "Band-Aid", "Bank of America", "Barbie", "Barclays", "Barnes & Noble",
  "Bass Pro Shops", "Baskin-Robbins", "BBC", "Ben & Jerry's", "Best Buy",
  "Betterment", "Bic", "Bing", "Birkenstock", "BlackBerry", "Blizzard",
  "Bloomberg", "Blue Bottle", "BMW", "Boeing", "Booking.com", "Bose",
  "Boston Market", "BP", "Brooks", "Budweiser", "Buffer", "Bugatti",
  "Buick", "Burger King", "Burberry", "Burt's Bees", "BYD", "Cadillac",
  "Cafe Nero", "Calvin Klein", "Campbell's", "Canon", "Capcom", "Carhartt",
  "Cartier", "Casio", "Caterpillar", "Chanel", "Chase", "ChatGPT",
  "Cheerios", "Chevrolet", "Chevron", "Chick-fil-A", "Chobani", "Chrysler",
  "Chubb", "Cisco", "Citibank", "Citroen", "Clinique", "Clorox", "CNN",
  "Coach", "Coca-Cola", "Colgate", "Columbia", "Comcast", "Converse",
  "Coors", "Costco", "Cotton On", "Coursera", "Crayola", "Credit Suisse",
  "Crocs", "CVS", "Dannon", "Decathlon", "Deloitte", "Delta", "Dell",
  "Diageo", "Dior", "Discord", "Discovery", "Disney", "Dollar General",
  "Dollar Shave Club", "Dollar Tree", "Domino's", "Doritos", "Dove",
  "Dropbox", "Dr Pepper", "Dunkin", "Duolingo", "Duracell", "Dyson",
  "EA", "eBay", "Eddie Bauer", "Emirates", "Equinox", "ESPN", "Estée Lauder",
  "Etsy", "Evian", "Exxon", "Facebook", "Fanta", "FedEx", "Ferrari",
  "Fiat", "Fidelity", "Fifa", "Fila", "Firefox", "Fitbit", "Five Guys",
  "Fiverr", "Flickr", "Foot Locker", "Ford", "Forever 21", "Fox",
  "Frito-Lay", "Fuji", "Gap", "Gatorade", "Geico", "General Electric",
  "General Mills", "Gillette", "GitHub", "GitLab", "Glossier", "Gmail",
  "GoDaddy", "Goldman Sachs", "Google", "GoPro", "Gucci", "Guess",
  "Guinness", "H&M", "Häagen-Dazs", "Harley-Davidson", "Hasbro", "HBO",
  "Headspace", "Heineken", "Hellmann's", "Hermès", "Hershey", "Hertz",
  "Hewlett Packard", "Hilton", "Holiday Inn", "Home Depot", "Honda",
  "HP", "HSBC", "Hulu", "Hyundai", "IBM", "Ikea", "IHOP", "Ikea",
  "Indeed", "Infiniti", "Instacart", "Instagram", "Intel", "Intuit",
  "Jack Daniel's", "Jaguar", "JBL", "Jeep", "JetBlue", "John Deere",
  "Johnson & Johnson", "J.Crew", "JPMorgan", "Kayak", "Kellogg's",
  "Kendra Scott", "Keurig", "KFC", "Kia", "Kimberly-Clark", "Kindle",
  "KitKat", "Kia", "Kleenex", "Kmart", "Kohl's", "Komatsu", "Kraft",
  "Kroger", "L.L.Bean", "Lacoste", "Lamborghini", "Land Rover", "Lay's",
  "LEGO", "Lenovo", "Levi's", "Lexus", "LG", "LinkedIn", "Lipton",
  "L'Oreal", "Louis Vuitton", "Lowe's", "Lufthansa", "Lululemon", "Lyft",
  "Macy's", "Mazda", "Mastercard", "Mattel", "Maybelline", "McDonald's",
  "Mercedes", "Meta", "Michelin", "Microsoft", "Minolta", "Mini",
  "Mitsubishi", "Miu Miu", "Mobil", "Moncler", "Mondelēz", "Monster",
  "Moosejaw", "Morgan Stanley", "Motorola", "Mountain Dew", "Mozilla",
  "MSNBC", "MTV", "Nabisco", "NASCAR", "Nature Valley", "NBC", "Nerf",
  "Nespresso", "Nestle", "Netflix", "New Balance", "New York Times",
  "Nextdoor", "NFL", "NHL", "Nickelodeon", "Nike", "Nikon", "Nintendo",
  "Nissan", "Nokia", "Nordstrom", "North Face", "Norwegian", "Nvidia",
  "Oakley", "Office Depot", "Old Navy", "Old Spice", "Olive Garden",
  "Olympus", "OpenAI", "Oracle", "Oreo", "Outback", "Overwatch",
  "PacSun", "Panasonic", "Pandora", "Panera", "Paramount", "Patagonia",
  "PayPal", "Pepsi", "Petco", "PetSmart", "Peugeot", "Pfizer", "Philips",
  "Pinterest", "Pixar", "Pizza Hut", "PlayStation", "Popeyes", "Porsche",
  "Pottery Barn", "Prada", "Prime Video", "Procter & Gamble", "Puma",
  "Qantas", "Qdoba", "Quaker", "Qualcomm", "Quiznos", "QVC", "Ragu",
  "Ralph Lauren", "Razer", "Ray-Ban", "Red Bull", "Reddit", "Reebok",
  "REI", "Renault", "Rolex", "Roku", "Rolls-Royce", "Roomba", "Ryanair",
  "Safeway", "Salesforce", "Samsung", "SanDisk", "SAP", "Saucony",
  "Sega", "Sephora", "Shell", "Sherwin-Williams", "Shopify", "Siemens",
  "SiriusXM", "Sketchers", "Skype", "Slack", "Smartwater", "Snapchat",
  "Snickers", "Sony", "SoundCloud", "Southwest", "SpaceX", "Spanx",
  "Spotify", "Sprite", "Square", "Starbucks", "State Farm", "Staples",
  "Starburst", "Steam", "Stitch Fix", "Subaru", "Subway", "Suzuki",
  "Swatch", "T-Mobile", "Taco Bell", "Target", "Tata", "Ted Baker",
  "Tencent", "Tesla", "Tetley", "The Economist", "Thomson Reuters",
  "Thule", "Tiffany", "TikTok", "Timberland", "Tim Hortons", "TJ Maxx",
  "Toms", "Toshiba", "Toyota", "Trader Joe's", "Trello", "Tropicana",
  "Trulia", "Tumi", "Twilio", "Twitch", "Twitter", "Tylenol", "Uber",
  "Ubisoft", "Ulta", "Under Armour", "Unilever", "Uniqlo", "United",
  "UPS", "Urban Outfitters", "USPS", "Vans", "Vanguard", "Venmo",
  "Verizon", "Visa", "Volkswagen", "Volvo", "Walgreens", "Walmart",
  "Warner Bros", "Wayfair", "WeChat", "Wells Fargo", "Wendy's",
  "Western Digital", "Western Union", "WhatsApp", "Whole Foods",
  "Wikipedia", "Williams-Sonoma", "Wix", "WordPress", "Workday",
  "Wrangler", "Xbox", "Xerox", "Xfinity", "Xiaomi", "Yahoo", "Yamaha",
  "Yelp", "Yeti", "YouTube", "Yves Saint Laurent", "Zappos", "Zara",
  "Zendesk", "Zillow", "Zipcar", "Zippo", "Zoom", "Zara", "Adidas",
  "Reformation", "Allbirds", "Away", "Glossier", "Warby Parker",
  "Casper", "Peloton", "Sweetgreen", "Chipotle", "Shake Shack",
  "In-N-Out", "White Castle", "Whataburger", "Sonic", "Carl's Jr",
  "Hardee's", "Long John Silver's", "A&W", "Dairy Queen", "Krispy Kreme",
  "Cinnabon", "Auntie Anne's", "Jamba", "Smoothie King", "Panda Express",
  "Pei Wei", "Noodles & Company", "Cheesecake Factory", "Red Lobster",
  "Applebee's", "Chili's", "TGI Fridays", "Buffalo Wild Wings",
  "Hooters", "Cracker Barrel", "IHOP", "Denny's", "Waffle House",
  "Marriott", "Hyatt", "Hilton", "Sheraton", "Westin", "Ritz-Carlton",
  "Four Seasons", "Accor", "Ibis", "Motel 6", "Super 8", "Airbnb",
  "Vrbo", "Expedia", "Kayak", "Priceline", "Tripadvisor", "Lonely Planet",
  "Michelin", "Goodyear", "Bridgestone", "Pirelli", "Continental",
  "Castrol", "Valvoline", "Pennzoil", "Mobil", "Gulf", "Texaco",
  "Sunoco", "Marathon", "Speedway", "Circle K", "Wawa", "Sheetz",
  "Buc-ee's", "Pilot", "Love's", "AlaMo", "Enterprise", "Hertz", "National",
  "Budget", "Sixt", "Zipcar", "Lyft", "Uber", "Grab", "Didi", "Bolt",
  "Skype", "Zoom", "Teams", "Webex", "Slack", "Notion", "Asana",
  "Monday", "Jira", "Confluence", "Figma", "Canva", "Adobe", "Sketch",
  "Invision", "Dropbox", "Box", "Google Drive", "iCloud", "OneDrive",
  "Evernote", "Obsidian", "Roam", "Todoist", "Things", "Fantastical",
  "Spotify", "Apple Music", "YouTube Music", "Pandora", "Deezer",
  "Tidal", "SoundCloud", "Bandcamp", "Audible", "Kindle", "Scribd",
  "Netflix", "Hulu", "Disney Plus", "Max", "Peacock", "Paramount Plus",
  "Apple TV", "Amazon Prime", "Crunchyroll", "Twitch", "Kick",
  "PlayStation", "Xbox", "Nintendo", "Steam", "Epic Games", "Origin",
  "Battle.net", "Ubisoft", "EA Sports", "Rockstar", "Sega", "Capcom",
  "Square Enix", "Bandai", "Namco", "Konami", "Bethesda", "Riot Games",
  "Valve", "Blizzard", "Activision", "Take-Two", "2K", "Sony",
  "Panasonic", "Sharp", "Toshiba", "Hitachi", "Fujitsu", "NEC",
  "Huawei", "Xiaomi", "Oppo", "Vivo", "OnePlus", "Realme", "Honor",
  "Motorola", "Nokia", "BlackBerry", "HTC", "Google Pixel", "Nothing",
  "Bose", "Sonos", "JBL", "Beats", "Sennheiser", "Audio-Technica",
  "Shure", "Harman Kardon", "Bang & Olufsen", "Marshall", "Klipsch",
  "Canon", "Nikon", "Sony", "Fujifilm", "Leica", "Olympus", "GoPro",
  "DJI", "Insta360", "Polaroid", "Kodak", "Rolex", "Omega", "Tag Heuer",
  "Casio", "Seiko", "Citizen", "Timex", "Swatch", "Tissot", "Cartier",
  "Tiffany", "Pandora", "Kay", "Zales", "Blue Nile", "Brilliant Earth",
  "Nike", "Adidas", "Puma", "Reebok", "New Balance", "Asics", "Brooks",
  "Hoka", "On", "Saucony", "Mizuno", "Under Armour", "Lululemon",
  "Athleta", "Alo", "Vuori", "Outdoor Voices", "Patagonia", "North Face",
  "Columbia", "Arc'teryx", "Mammut", "Salewa", "Merrell", "Keen",
  "Teva", "Crocs", "Ugg", "Dr. Martens", "Timberland", "Clarks",
  "Steve Madden", "Aldo", "Nine West", "Jimmy Choo", "Manolo Blahnik",
  "Christian Louboutin", "Gucci", "Prada", "Louis Vuitton", "Chanel",
  "Dior", "Hermes", "Balenciaga", "Givenchy", "Valentino", "Versace",
  "Armani", "Dolce & Gabbana", "Fendi", "Bottega Veneta", "Celine",
  "Saint Laurent", "Burberry", "Coach", "Kate Spade", "Michael Kors",
  "Tory Burch", "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein",
  "Hugo Boss", "Lacoste", "Fred Perry", "Polo", "Brooks Brothers",
  "J.Crew", "Banana Republic", "Gap", "Old Navy", "Uniqlo", "Zara",
  "H&M", "Forever 21", "Shein", "Temu", "ASOS", "Boohoo", "PrettyLittleThing",
  "Urban Outfitters", "Anthropologie", "Free People", "Madewell",
  "Everlane", "Reformation", "Aritzia", "Lululemon", "Victoria's Secret",
  "Bath & Body Works", "The Body Shop", "Lush", "Sephora", "Ulta",
  "MAC", "NARS", "Clinique", "Estée Lauder", "Lancome", "Maybelline",
  "CoverGirl", "Revlon", "NYX", "e.l.f.", "Fenty", "Rare Beauty",
  "Glossier", "The Ordinary", "CeraVe", "Cetaphil", "Neutrogena",
  "Olay", "Dove", "Axe", "Old Spice", "Degree", "Secret", "Gillette",
  "Schick", "Harry's", "Dollar Shave Club", "Crest", "Colgate",
  "Oral-B", "Sensodyne", "Listerine", "Scope", "Pampers", "Huggies",
  "Johnson's", "Johnson & Johnson", "Band-Aid", "Neosporin", "Tylenol",
  "Advil", "Aleve", "Motrin", "NyQuil", "DayQuil", "Robitussin",
  "Vicks", "Halls", "Ricola", "Kleenex", "Cottonelle", "Charmin",
  "Bounty", "Scott", "Dawn", "Cascade", "Tide", "Gain", "Downy",
  "Bounce", "Febreze", "Glade", "Air Wick", "Lysol", "Clorox",
  "Mr. Clean", "Windex", "Pledge", "Swiffer", "OxiClean", "Shout",
  "Heinz", "Hunt's", "Del Monte", "Campbell's", "Progresso", "Amy's",
  "Kraft", "Hellmann's", "Hidden Valley", "French's", "Grey Poupon",
  "Tabasco", "Sriracha", "Frank's RedHot", "Cholula", "McCormick",
  "Lawry's", "Old Bay", "Tony Chachere's", "Nestle", "Hershey",
  "Mars", "Ferrero", "Lindt", "Ghirardelli", "Godiva", "Toblerone",
  "KitKat", "Snickers", "Twix", "Milky Way", "M&M's", "Reese's",
  "Butterfinger", "Baby Ruth", "Almond Joy", "Mounds", "York",
  "Skittles", "Starburst", "Life Savers", "Jolly Rancher", "Tootsie",
  "Haribo", "Sour Patch Kids", "Swedish Fish", "Twizzlers", "Red Vines",
  "Oreo", "Chips Ahoy", "Nutter Butter", "Graham", "Ritz", "Triscuits",
  "Wheat Thins", "Cheez-It", "Goldfish", "Cheetos", "Doritos", "Lays",
  "Ruffles", "Pringles", "Kettle", "Cape Cod", "Popchips", "Pirate's Booty",
  "Quaker", "Cheerios", "Frosted Flakes", "Froot Loops", "Lucky Charms",
  "Cinnamon Toast Crunch", "Reese's Puffs", "Cocoa Puffs", "Trix",
  "Special K", "Raisin Bran", "Corn Flakes", "Rice Krispies", "Kashi",
  "Nature Valley", "Clif", "Kind", "RxBar", "Larabar", "Quest",
  "Gatorade", "Powerade", "Vitaminwater", "Smartwater", "Dasani",
  "Aquafina", "Evian", "Fiji", "Pellegrino", "Perrier", "La Croix",
  "Bubly", "Topo Chico", "Coca-Cola", "Pepsi", "Sprite", "Fanta",
  "Mountain Dew", "Dr Pepper", "7 Up", "A&W", "Barq's", "Mug",
  "Schweppes", "Canada Dry", "Red Bull", "Monster", "Rockstar",
  "Celsius", "Prime", "Bang", "Starbucks", "Dunkin", "Peet's",
  "Caribou", "Tim Hortons", "Dutch Bros", "The Coffee Bean",
  "Nespresso", "Keurig", "Folgers", "Maxwell House", "Starbucks",
  "Lipton", "Tazo", "Twinings", "Celestial Seasonings", "Yogi",
  "Honest Tea", "Gold Peak", "Arizona", "Snapple", "Minute Maid",
  "Tropicana", "Simply", "Florida's Natural", "Ocean Spray", "V8",
  "Capri Sun", "Kool-Aid", "Tang", "Nesquik", "Ovaltine", "Horlicks",
  "Yoplait", "Chobani", "Fage", "Oikos", "Activia", "Dannon",
  "Philadelphia", "Sargento", "Tillamook", "Cabot", "Kerry", "Lactaid",
  "Silk", "Oatly", "Almond Breeze", "Califia", "Ripple", "Beyond Meat",
  "Impossible", "Gardein", "Boca", "MorningStar", "Quorn", "Tofurky",
  "Boeing", "Airbus", "Embraer", "Bombardier", "Lockheed Martin",
  "Northrop Grumman", "Raytheon", "SpaceX", "Blue Origin", "Virgin Galactic",
  "NASA", "Tesla", "Rivian", "Lucid", "Polestar", "BYD", "NIO",
  "XPeng", "Li Auto", "Ford", "GM", "Chevrolet", "Cadillac", "Buick",
  "GMC", "Chrysler", "Dodge", "Jeep", "Ram", "Lincoln", "Tesla",
  "Toyota", "Lexus", "Honda", "Acura", "Nissan", "Infiniti", "Mazda",
  "Subaru", "Mitsubishi", "Suzuki", "Hyundai", "Kia", "Genesis",
  "Volkswagen", "Audi", "Porsche", "BMW", "Mini", "Mercedes",
  "Maybach", "Smart", "Volvo", "Polestar", "Saab", "Jaguar",
  "Land Rover", "Bentley", "Rolls-Royce", "Aston Martin", "McLaren",
  "Ferrari", "Lamborghini", "Maserati", "Alfa Romeo", "Fiat",
  "Peugeot", "Citroen", "Renault", "Dacia", "Opel", "Vauxhall",
  "Skoda", "Seat", "Cupra", "Ferrari", "Pagani", "Bugatti", "Koenigsegg",
];

function flattenNames(value) {
  if (!value) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenNames);
  if (typeof value === "object") return Object.values(value).flatMap(flattenNames);
  return [];
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const [species, animalTxt, animalUnfiltered, citiesCsv, fortune, cars, commonAnimals] =
    await Promise.all([
      fetchJson("https://pokeapi.co/api/v2/pokemon-species?limit=2000"),
      fetchText("https://raw.githubusercontent.com/skjorrface/animals.txt/master/animals.txt"),
      fetchText("https://raw.githubusercontent.com/jneidel/animal-names/master/animals-unfiltered.txt"),
      fetchText("https://raw.githubusercontent.com/datasets/world-cities/master/data/world-cities.csv"),
      fetchJson("https://raw.githubusercontent.com/dariusk/corpora/master/data/corporations/fortune500.json").catch(() => ({ companies: [] })),
      fetchJson("https://raw.githubusercontent.com/dariusk/corpora/master/data/corporations/cars.json").catch(() => ({ cars: [] })),
      fetchJson("https://raw.githubusercontent.com/dariusk/corpora/master/data/animals/common.json").catch(() => ({ animals: [] })),
    ]);

  const pokemon = species.results.map((entry) => displayPokemon(entry.name));

  const animals = [
    ...animalTxt.split(/\r?\n/),
    ...animalUnfiltered.split(/\r?\n/).filter((name) => !isJunkAnimal(name)),
    ...((commonAnimals.animals || commonAnimals) ?? []),
    ...EXTRA_ANIMALS,
  ]
    .map((name) => String(name).replace(/[-_]+/g, " "))
    .map((name) => titleCase(name))
    .filter((name) => !ANIMAL_SKIP.has(name.toLowerCase()));

  const cities = citiesCsv
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      if (!line) return "";
      if (line.startsWith('"')) {
        const end = line.indexOf('"', 1);
        return end === -1 ? line.slice(1) : line.slice(1, end);
      }
      return line.split(",")[0];
    })
    .filter(Boolean)
    .map((name) => titleCase(name));

  const brands = [
    ...EXTRA_BRANDS,
    ...flattenNames(fortune),
    ...flattenNames(cars),
  ].map(cleanBrand)
    .filter((name) => name.length >= 2 && name.length <= 40 && name.split(" ").length <= 5);

  const counts = {
    animals: writeList("animals.js", animals),
    brands: writeList("brands.js", brands),
    cities: writeList("cities.js", cities),
    pokemon: writeList("pokemon.js", pokemon),
  };

  console.log(counts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
