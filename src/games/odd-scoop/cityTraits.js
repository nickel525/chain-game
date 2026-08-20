import CITIES from "../../data/cities.js";
import { fillNamed, normalizeName } from "./match.js";

const POOL = CITIES.filter((name) => {
  const normal = normalizeName(name);
  return normal.length >= 3 && normal.length <= 28;
});

const REGION = [
  {
    three: "are in North America",
    one: "is in North America",
    words: [
      "Atlanta", "Boston", "Calgary", "Chicago", "Dallas", "Denver", "Houston",
      "Los Angeles", "Mexico City", "Miami", "Montreal", "New York City",
      "Ottawa", "Philadelphia", "Quebec", "San Francisco", "Seattle",
      "Toronto", "Vancouver", "Washington",
    ],
  },
  {
    three: "are in South America",
    one: "is in South America",
    words: [
      "Bogota", "Brasilia", "Buenos Aires", "Lima", "Santiago", "Sao Paulo",
    ],
  },
  {
    three: "are in Europe",
    one: "is in Europe",
    words: [
      "Amsterdam", "Athens", "Barcelona", "Basel", "Belfast", "Belgrade",
      "Berlin", "Birmingham", "Brussels", "Bucharest", "Budapest", "Cardiff",
      "Copenhagen", "Dublin", "Edinburgh", "Florence", "Frankfurt", "Geneva",
      "Glasgow", "Hamburg", "Helsinki", "Kyiv", "Lisbon", "Liverpool", "London",
      "Luxembourg", "Lyon", "Madrid", "Manchester", "Marseille", "Milan",
      "Minsk", "Moscow", "Munich", "Naples", "Oslo", "Paris", "Porto", "Prague",
      "Reykjavik", "Riga", "Rome", "Rotterdam", "Sofia", "Stockholm",
      "Stuttgart", "Tallinn", "The Hague", "Valencia", "Valletta", "Venice",
      "Vienna", "Vilnius", "Warsaw", "Zagreb", "Zurich",
    ],
  },
  {
    three: "are in Asia",
    one: "is in Asia",
    words: [
      "Abu Dhabi", "Amman", "Ankara", "Baghdad", "Baku", "Bangkok", "Beijing",
      "Beirut", "Bengaluru", "Chennai", "Delhi", "Doha", "Dubai", "Hanoi",
      "Hong Kong", "Hyderabad", "Istanbul", "Jakarta", "Jerusalem", "Karachi",
      "Kolkata", "Kuala Lumpur", "Kyoto", "Manila", "Mumbai", "Muscat",
      "New Delhi", "Osaka", "Riyadh", "Seoul", "Shanghai", "Singapore",
      "Taipei", "Tashkent", "Tbilisi", "Tehran", "Tel Aviv", "Tokyo", "Yerevan",
    ],
  },
  {
    three: "are in Africa",
    one: "is in Africa",
    words: [
      "Accra", "Addis Ababa", "Alexandria", "Algiers", "Cairo", "Cape Town",
      "Casablanca", "Dakar", "Durban", "Harare", "Johannesburg", "Kampala",
      "Kinshasa", "Lagos", "Luanda", "Lusaka", "Maputo", "Nairobi", "Pretoria",
      "Rabat", "Tunis",
    ],
  },
  {
    three: "are in Australia or New Zealand",
    one: "is in Australia or New Zealand",
    words: ["Auckland", "Brisbane", "Canberra", "Melbourne", "Sydney", "Wellington"],
  },
];

const CAPITALS = [
  {
    three: "are national capitals",
    one: "is a national capital",
    words: [
      "Abu Dhabi", "Accra", "Addis Ababa", "Algiers", "Amman", "Amsterdam",
      "Ankara", "Athens", "Baghdad", "Baku", "Beijing", "Beirut", "Berlin",
      "Bogota", "Brasilia", "Brussels", "Bucharest", "Budapest", "Buenos Aires",
      "Cairo", "Canberra", "Copenhagen", "Dakar", "Doha", "Dublin", "Hanoi",
      "Harare", "Helsinki", "Jakarta", "Jerusalem", "Kampala", "Kinshasa",
      "Kuala Lumpur", "Kyiv", "Lima", "Lisbon", "London", "Luanda", "Lusaka",
      "Luxembourg", "Madrid", "Maputo", "Mexico City", "Minsk", "Moscow",
      "Muscat", "Nairobi", "New Delhi", "Nicosia", "Oslo", "Ottawa", "Paris",
      "Prague", "Pretoria", "Rabat", "Reykjavik", "Riga", "Riyadh", "Rome",
      "Santiago", "Seoul", "Singapore", "Sofia", "Stockholm", "Taipei",
      "Tallinn", "Tashkent", "Tbilisi", "Tehran", "Tokyo", "Tunis", "Valletta",
      "Vienna", "Vilnius", "Warsaw", "Washington", "Wellington", "Yerevan",
      "Zagreb",
    ],
  },
  {
    three: "are not national capitals",
    one: "is not a national capital",
    words: [
      "Alexandria", "Atlanta", "Auckland", "Barcelona", "Basel", "Belfast",
      "Bengaluru", "Birmingham", "Boston", "Brisbane", "Calgary", "Cape Town",
      "Casablanca", "Chennai", "Chicago", "Dallas", "Denver", "Dubai",
      "Durban", "Edinburgh", "Florence", "Frankfurt", "Geneva", "Glasgow",
      "Hamburg", "Hong Kong", "Houston", "Hyderabad", "Istanbul", "Johannesburg",
      "Karachi", "Kolkata", "Kyoto", "Lagos", "Leeds", "Liverpool",
      "Los Angeles", "Lyon", "Manchester", "Manila", "Marseille", "Melbourne",
      "Miami", "Milan", "Montreal", "Mumbai", "Munich", "Naples",
      "New York City", "Osaka", "Philadelphia", "Porto", "Quebec", "Rotterdam",
      "San Francisco", "Sao Paulo", "Seattle", "Shanghai", "Stuttgart",
      "Sydney", "Tel Aviv", "The Hague", "Toronto", "Toulouse", "Turin",
      "Valencia", "Vancouver", "Venice", "Zurich",
    ],
  },
];

const COAST = [
  {
    three: "are coastal cities",
    one: "is a coastal city",
    words: [
      "Accra", "Alexandria", "Auckland", "Barcelona", "Boston", "Brisbane",
      "Cape Town", "Casablanca", "Copenhagen", "Dakar", "Dubai", "Dublin",
      "Durban", "Edinburgh", "Hamburg", "Hong Kong", "Istanbul", "Jakarta",
      "Lagos", "Lima", "Lisbon", "Liverpool", "Los Angeles", "Manila",
      "Marseille", "Melbourne", "Miami", "Mumbai", "Naples", "New York City",
      "Osaka", "Oslo", "Porto", "Rotterdam", "San Francisco", "Seattle",
      "Shanghai", "Singapore", "Stockholm", "Sydney", "Tel Aviv", "Tokyo",
      "Tunis", "Valencia", "Vancouver", "Venice",
    ],
  },
  {
    three: "are inland cities",
    one: "is an inland city",
    words: [
      "Addis Ababa", "Ankara", "Atlanta", "Baghdad", "Beijing", "Berlin",
      "Bogota", "Brasilia", "Brussels", "Budapest", "Cairo", "Calgary",
      "Canberra", "Chicago", "Dallas", "Delhi", "Denver", "Geneva", "Jerusalem",
      "Johannesburg", "Kampala", "Kinshasa", "Kyiv", "Luxembourg", "Madrid",
      "Mexico City", "Milan", "Minsk", "Moscow", "Munich", "Nairobi",
      "New Delhi", "Ottawa", "Paris", "Prague", "Pretoria", "Riyadh", "Rome",
      "Santiago", "Sofia", "Tehran", "Vienna", "Warsaw", "Washington",
      "Zurich",
    ],
  },
];

const DIMENSIONS = [
  { id: "region", buckets: fillNamed(POOL, REGION) },
  { id: "capital", buckets: fillNamed(POOL, CAPITALS) },
  { id: "coast", buckets: fillNamed(POOL, COAST) },
].filter((dimension) => dimension.buckets.length >= 2);

export const CITY_DOMAIN = {
  id: "cities",
  label: "cities",
  dimensions: DIMENSIONS,
  weight(dimension) {
    return dimension.id === "region" ? 2 : 1;
  },
};
