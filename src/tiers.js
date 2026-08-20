export const TIERS = [
  { min: 0, id: "spark", name: "Spark" },
  { min: 3, id: "bronze", name: "Bronze" },
  { min: 5, id: "silver", name: "Silver" },
  { min: 10, id: "gold", name: "Gold" },
  { min: 15, id: "ruby", name: "Ruby" },
  { min: 25, id: "sapphire", name: "Sapphire" },
  { min: 40, id: "mythic", name: "Mythic" },
];

export const STRETCH_TIERS = [
  { min: 0, id: "spark", name: "Spark" },
  { min: 5, id: "bronze", name: "Bronze" },
  { min: 7, id: "silver", name: "Silver" },
  { min: 9, id: "gold", name: "Gold" },
  { min: 11, id: "ruby", name: "Ruby" },
  { min: 13, id: "sapphire", name: "Sapphire" },
  { min: 15, id: "mythic", name: "Mythic" },
];

export function getTier(streak, tiers = TIERS) {
  let current = tiers[0];
  for (const tier of tiers) {
    if (streak >= tier.min) current = tier;
  }
  return current;
}

export function getNextTier(tier, tiers = TIERS) {
  const index = tiers.findIndex((item) => item.id === tier.id);
  return tiers[index + 1] ?? null;
}

export function tierProgress(streak, tier, next) {
  if (!next) return 1;
  const span = next.min - tier.min;
  return Math.min(1, Math.max(0, (streak - tier.min) / span));
}
