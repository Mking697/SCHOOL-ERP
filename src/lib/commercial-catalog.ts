export const INITIAL_PURCHASE_PRICE_INR = 9999;
export const INITIAL_PURCHASE_DAYS = 30;

export const RENEWAL_PLANS = [
  { id: 'MONTHLY', label: 'Monthly', months: 1, days: 30, priceInr: 5000, discountPct: 0, savingsInr: 0, monthlyEquivalentInr: 5000 },
  { id: 'HALF_YEARLY', label: 'Half-yearly', months: 6, days: 182, priceInr: 27000, discountPct: 10, savingsInr: 3000, monthlyEquivalentInr: 4500 },
  { id: 'YEARLY', label: 'Yearly', months: 12, days: 365, priceInr: 51000, discountPct: 15, savingsInr: 9000, monthlyEquivalentInr: 4250 },
] as const;

export const SCHOOL_TIERS = [
  { id: 'STARTER', label: 'Starter', maxStudents: 300, monthlyPriceInr: 2000 },
  { id: 'GROWTH', label: 'Growth', maxStudents: 800, monthlyPriceInr: 3000 },
  { id: 'PROFESSIONAL', label: 'Professional', maxStudents: 1500, monthlyPriceInr: 5000 },
] as const;

export type SchoolTier = typeof SCHOOL_TIERS[number]['id'];
export type RenewalPlan = typeof RENEWAL_PLANS[number]['id'];

export function isSchoolTier(value: unknown): value is SchoolTier {
  return SCHOOL_TIERS.some(tier => tier.id === value);
}

export function plansForTier(tier: SchoolTier) {
  const monthlyPrice = SCHOOL_TIERS.find(item => item.id === tier)!.monthlyPriceInr;
  return RENEWAL_PLANS.map(plan => {
    const undiscounted = monthlyPrice * plan.months;
    const priceInr = undiscounted * (100 - plan.discountPct) / 100;
    return { ...plan, priceInr, savingsInr: undiscounted - priceInr, monthlyEquivalentInr: priceInr / plan.months };
  });
}

export function isRenewalPlan(value: unknown): value is RenewalPlan {
  return RENEWAL_PLANS.some(plan => plan.id === value);
}
