import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import * as catalog from "../src/lib/commercial-catalog";

type Status = { active: boolean; schoolName: string; plan: string; currentPeriodEnd: string; daysLeft: number; pricingTier?: unknown; maxStudents?: number };
type SubscriptionApi = { checkSubscription: () => Promise<Status | null>; invalidateSubscriptionCache: () => void };
const source = readFileSync(new URL("../src/lib/subscription.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function bundle(shared: Record<string | symbol, unknown>, fetchImpl: typeof fetch): SubscriptionApi {
  const exports: Record<string, unknown> = {};
  runInNewContext(compiled, {
    exports, globalThis: shared, fetch: fetchImpl, Date, AbortSignal,
    require: (name: string) => {
      if (name === "./commercial-catalog") return catalog;
      throw Error(`Unexpected subscription import ${name}`);
    },
    process: { env: { VENDOR_SERVER_URL: "https://vendor.example.test", SCHOOL_API_KEY: "fixture-school" } },
  });
  return exports as SubscriptionApi;
}
const status = (active: boolean, end = new Date(Date.now() + 86400000).toISOString()): Status => ({ active, schoolName: "QA School", plan: "MONTHLY", currentPeriodEnd: end, daysLeft: active ? 1 : 0 });

test("layout passes the vendor-selected pricing tier to the expired subscription gate", async () => {
  const layoutSource = readFileSync(new URL("../src/app/(app)/layout.tsx", import.meta.url), "utf8");
  const output = ts.transpileModule(layoutSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  type Element = { type: unknown; props: Record<string, unknown> };
  const gate = () => null;
  const exports: { default?: (props: { children: null }) => Promise<Element> } = {};
  let selectedTier = "STARTER";
  const jsx = (type: unknown, props: Element["props"]) => ({ type, props });
  runInNewContext(output, {
    exports,
    require: (name: string) => {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "next/navigation") return { redirect: () => { throw Error("Unexpected redirect"); } };
      if (name === "@/lib/session") return { getSession: async () => ({ email: "qa@example.test", role: "ADMIN" }) };
      if (name === "@/lib/db") return { prisma: { school: { findFirst: async () => ({ name: "Layout QA" }) } } };
      if (name === "@/lib/subscription") return { checkSubscription: async () => ({ ...status(false), pricingTier: selectedTier }) };
      if (name === "@/components/subscription-gate") return { __esModule: true, default: gate };
      if (name === "@/components/layout/sidebar" || name === "@/components/layout/topbar") return {};
      throw Error(`Unexpected layout import ${name}`);
    },
  });
  assert.ok(exports.default);
  for (const tier of ["STARTER", "GROWTH", "PROFESSIONAL"]) {
    selectedTier = tier;
    const element = await exports.default({ children: null });
    assert.equal(element.type, gate);
    assert.equal(element.props.schoolName, "Layout QA");
    assert.equal(element.props.pricingTier, tier);
  }
});

test("vendor-selected pricing tier is preserved and legacy or invalid tiers safely use Professional", async () => {
  for (const [input, expected, maxStudents] of [["STARTER", "STARTER", 300], ["GROWTH", "GROWTH", 800], ["PROFESSIONAL", "PROFESSIONAL", 1500], [undefined, "PROFESSIONAL", 1500], ["CUSTOM", "PROFESSIONAL", 1500], [null, "PROFESSIONAL", 1500]] as const) {
    const api = bundle({}, async () => Response.json({ ...status(false), pricingTier: input }));
    const result = await api.checkSubscription();
    assert.equal(result?.pricingTier, expected);
    assert.equal(result?.maxStudents, maxStudents);
  }
});

test("route-bundle invalidation clears the layout-bundle subscription cache in the same server", async () => {
  const shared = {};
  let current = status(true);
  let calls = 0;
  const provider: typeof fetch = async () => { calls++; return Response.json(current); };
  const layout = bundle(shared, provider);
  const route = bundle(shared, provider);
  const first = await layout.checkSubscription();
  current = status(true, new Date(Date.now() + 30 * 86400000).toISOString());
  route.invalidateSubscriptionCache();
  const refreshed = await layout.checkSubscription();
  assert.notEqual(refreshed?.currentPeriodEnd, first?.currentPeriodEnd);
  assert.equal(calls, 2);
});

test("inactive subscription is rechecked after renewal even when a different worker cannot invalidate it", async () => {
  let current = status(false);
  let calls = 0;
  const layout = bundle({}, async () => { calls++; return Response.json(current); });
  assert.equal((await layout.checkSubscription())?.active, false);
  current = status(true);
  assert.equal((await layout.checkSubscription())?.active, true);
  assert.equal(calls, 2);
});
