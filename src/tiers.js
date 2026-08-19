export const TIERS = [
  { min: 0, id: "spark", name: "Spark" },
  { min: 3, id: "bronze", name: "Bronze" },
  { min: 5, id: "silver", name: "Silver" },
  { min: 10, id: "gold", name: "Gold" },
  { min: 15, id: "ruby", name: "Ruby" },
  { min: 25, id: "sapphire", name: "Sapphire" },
  { min: 40, id: "mythic", name: "Mythic" },
];

export function getTier(streak) {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (streak >= tier.min) current = tier;
  }
  return current;
}

export function getNextTier(tier) {
  const index = TIERS.findIndex((item) => item.id === tier.id);
  return TIERS[index + 1] ?? null;
}

export function tierProgress(streak, tier, next) {
  if (!next) return 1;
  const span = next.min - tier.min;
  return Math.min(1, Math.max(0, (streak - tier.min) / span));
}
