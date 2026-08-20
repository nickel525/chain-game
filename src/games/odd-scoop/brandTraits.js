import BRANDS from "../../data/brands.js";
import { fillNamed, normalizeName } from "./match.js";

const POOL = BRANDS.filter((name) => {
  const normal = normalizeName(name);
  return normal.length >= 2 && normal.length <= 36 && !normal.startsWith("a list of");
});

const INDUSTRY = [
  {
    three: "are car brands",
    one: "is a car brand",
    words: [
      "Abarth", "Acura", "Alfa Romeo", "Audi", "Bentley", "BMW", "Bugatti",
      "Buick", "Cadillac", "Chevrolet", "Chrysler", "Citroen", "Dodge",
      "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai",
      "Infiniti", "Jeep", "Kia", "Lamborghini", "Lexus", "Lincoln", "Maserati",
      "Mazda", "McLaren", "Mercedes", "Mini", "Mitsubishi", "Nissan",
      "Peugeot", "Porsche", "Ram", "Renault", "Subaru", "Suzuki", "Tesla",
      "Toyota", "Volkswagen", "Volvo",
    ],
  },
  {
    three: "are tech brands",
    one: "is a tech brand",
    words: [
      "Acer", "Adobe", "Airbnb", "Alibaba", "Android", "Apple", "Asus",
      "Cisco", "Dell", "Google", "Hewlett Packard", "Huawei", "IBM", "Intel",
      "Lenovo", "Lyft", "Microsoft", "Nokia", "Nvidia", "Oracle", "Samsung",
      "Sony", "Uber", "Xiaomi",
    ],
  },
  {
    three: "are food or drink brands",
    one: "is a food or drink brand",
    words: [
      "7 Up", "Activia", "Almond Breeze", "Almond Joy", "Anheuser-Busch",
      "Aquafina", "Arby's", "Burger King", "Coca-Cola", "Heinz", "Hershey",
      "Kellogg's", "KFC", "McDonald's", "Nestle", "Pepsi", "Pizza Hut",
      "Starbucks", "Subway", "Unilever",
    ],
  },
  {
    three: "are fashion or sportswear brands",
    one: "is a fashion brand",
    words: [
      "Adidas", "Aldo", "Allbirds", "Alo", "Anthropologie", "Chanel", "Converse",
      "Gap", "Gucci", "H&M", "Lululemon", "Nike", "Prada", "Puma", "Reebok",
      "Uniqlo", "Vans", "Zara",
    ],
  },
  {
    three: "are airlines",
    one: "is an airline",
    words: [
      "Air Canada", "Air France", "Alaska Air Group", "American Airlines",
      "Delta Air Lines", "Southwest Airlines",
    ],
  },
  {
    three: "are finance brands",
    one: "is a finance brand",
    words: [
      "Aetna", "Aflac", "Allstate", "Ally Financial", "American Express",
      "Bank of America", "Geico", "Goldman Sachs", "JPMorgan", "Mastercard",
      "PayPal", "Visa",
    ],
  },
  {
    three: "are game or entertainment brands",
    one: "is a game or entertainment brand",
    words: [
      "2K", "Activision", "Disney", "Epic Games", "Netflix", "Nintendo",
      "Riot Games",
    ],
  },
];

const ORIGIN = [
  {
    three: "are American brands",
    one: "is an American brand",
    words: [
      "Adobe", "Airbnb", "Amazon", "Apple", "Boeing", "Chevrolet", "Disney",
      "Ford", "Google", "IBM", "Intel", "Jeep", "Mastercard", "McDonald's",
      "Microsoft", "Netflix", "Nike", "Nvidia", "Oracle", "PayPal", "Pepsi",
      "Starbucks", "Target", "Tesla", "Uber", "Visa", "Walmart",
    ],
  },
  {
    three: "are Japanese brands",
    one: "is a Japanese brand",
    words: [
      "Acura", "Honda", "Infiniti", "Lexus", "Mazda", "Mitsubishi", "Nintendo",
      "Nissan", "Sony", "Subaru", "Suzuki", "Toyota", "Uniqlo", "Yamaha",
    ],
  },
  {
    three: "are German brands",
    one: "is a German brand",
    words: ["Adidas", "Audi", "BMW", "Mercedes", "Porsche", "Puma", "Volkswagen"],
  },
  {
    three: "are European brands",
    one: "is a European brand",
    words: [
      "Abarth", "Airbus", "Alfa Romeo", "Chanel", "Ferrari", "Fiat", "Gucci",
      "H&M", "Ikea", "Lamborghini", "Maserati", "Nestle", "Peugeot", "Prada",
      "Renault", "Volvo", "Zara",
    ],
  },
  {
    three: "are Korean brands",
    one: "is a Korean brand",
    words: ["Genesis", "Hyundai", "Kia", "Samsung"],
  },
];

const DIMENSIONS = [
  { id: "industry", buckets: fillNamed(POOL, INDUSTRY) },
  { id: "origin", buckets: fillNamed(POOL, ORIGIN) },
].filter((dimension) => dimension.buckets.length >= 2);

export const BRAND_DOMAIN = {
  id: "brands",
  label: "brands",
  dimensions: DIMENSIONS,
  weight(dimension) {
    return dimension.id === "industry" ? 2 : 1;
  },
};
