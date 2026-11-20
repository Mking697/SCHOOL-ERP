import assert from "node:assert/strict";
import test from "node:test";

const catalogPath = "../src/lib/commercial-catalog.ts";
test("school catalog prices three vendor-owned size tiers with exact cycle discounts", async () => {
  const catalog = await import(catalogPath);
  assert.deepEqual(catalog.SCHOOL_TIERS, [
    { id: "STARTER", label: "Starter", maxStudents: 300, monthlyPriceInr: 2000 },
    { id: "GROWTH", label: "Growth", maxStudents: 800, monthlyPriceInr: 3000 },
    { id: "PROFESSIONAL", label: "Professional", maxStudents: 1500, monthlyPriceInr: 5000 },
  ]);
  const prices = [[2000, 10800, 20400], [3000, 16200, 30600], [5000, 27000, 51000]];
  for (const [index, tier] of catalog.SCHOOL_TIERS.entries()) {
    assert.equal(catalog.isSchoolTier(tier.id), true);
    const plans = catalog.plansForTier(tier.id);
    assert.deepEqual(plans.map((p: { priceInr: number }) => p.priceInr), prices[index]);
    for (const plan of plans) {
      assert.equal(plan.savingsInr, tier.monthlyPriceInr * plan.months - plan.priceInr);
      assert.equal(plan.monthlyEquivalentInr, plan.priceInr / plan.months);
    }
  }
  for (const invalid of [undefined, null, "starter", "CUSTOM", {}, 300]) assert.equal(catalog.isSchoolTier(invalid), false);
  assert.deepEqual(catalog.RENEWAL_PLANS, catalog.plansForTier("PROFESSIONAL"));
  assert.deepEqual(catalog.RENEWAL_PLANS.map((p: { id: string }) => p.id), ["MONTHLY", "HALF_YEARLY", "YEARLY"]);
  assert.equal(catalog.isRenewalPlan("QUARTERLY"), false);
  assert.equal(catalog.INITIAL_PURCHASE_PRICE_INR, 9999);
  assert.equal(catalog.INITIAL_PURCHASE_DAYS, 30);
});
