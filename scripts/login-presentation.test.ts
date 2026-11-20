import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { createRequire } from "node:module";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as catalog from "../src/lib/commercial-catalog";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/app/login/login-form.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
type Node = ReactElement<{ children?: unknown; [key: string]: unknown }>;
function fixture(request: typeof fetch) {
  const states: unknown[] = [];
  const refs: { current: unknown }[] = [];
  let cursor = 0;
  let refCursor = 0;
  const navigation: string[] = [];
  const exports: { default?: (props: { schoolName: string; logoUrl: string | null }) => Node } = {};
  const input = (props: object) => createElement("input", props);
  runInNewContext(compiled, {
    exports, fetch: request, AbortSignal,
    require: (name: string) => {
      if (name === "react") return {
        useState: (initial: unknown) => { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], (v: unknown) => { states[index] = typeof v === "function" ? v(states[index]) : v; }]; },
        useRef: (initial: unknown) => refs[refCursor++] ?? (refs[refCursor - 1] = { current: initial }),
      };
      if (name === "react/jsx-runtime" || name === "lucide-react") return require(name);
      if (name === "next/navigation") return { useRouter: () => ({ push: (url: string) => navigation.push(url), refresh: () => navigation.push("refresh") }) };
      if (name === "next/link") return { __esModule: true, default: (props: object) => createElement("a", props) };
      if (name === "@/components/ui/input") return { Input: input, Label: (props: object) => createElement("label", props) };
      if (name === "@/components/ui/button") return { Button: (props: object) => createElement("button", props) };
      if (name === "@/components/ui/brand-mark") return { BrandMark: () => createElement("span", { "data-brand-mark": true }) };
      if (name === "@/lib/commercial-catalog") return catalog;
      throw Error(`Unexpected import ${name}`);
    },
  });
  const render = () => { cursor = 0; refCursor = 0; assert.ok(exports.default); return exports.default({ schoolName: "Green Valley School", logoUrl: null }); };
  const find = (predicate: (node: Node) => boolean, value: unknown = render()): Node | undefined => {
    if (!value || typeof value !== "object" || !("props" in value)) return;
    const node = value as Node;
    if (predicate(node)) return node;
    for (const child of Array.isArray(node.props.children) ? node.props.children : [node.props.children]) { if (child == null) continue; const found = find(predicate, child); if (found) return found; }
  };
  const submit = () => {
    const form = find(n => n.type === "form");
    assert.ok(form);
    return (form.props.onSubmit as (e: { preventDefault: () => void }) => Promise<void>)({ preventDefault() {} });
  };
  return { render, find, submit, navigation };
}

test("login presents truthful self-hosted details and setup plus three renewal plans", () => {
  const f = fixture(async () => Response.json({ ok: true }));
  const html = renderToStaticMarkup(f.render());
  for (const text of ["Green Valley School", "9,999", "30 days", "5,000", "27,000", "51,000", "10%", "15%", "your own server", "/portal/login", "/driver/login"]) assert.ok(html.includes(text), `Missing ${text}`);
  assert.ok(!html.includes("Quarterly"));
  assert.ok(!html.includes("href=\"#\""));
});

test("login shows truthful school-size pricing with all upfront cycle amounts and no invented purchase routes", () => {
  const html = renderToStaticMarkup(fixture(async () => Response.json({ ok: true })).render());
  const cards = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(match => match[0]);
  for (const [label, capacity, prices] of [
    ["Starter", "Up to 300 students", ["2,000", "10,800", "20,400", "1,800", "1,700"]],
    ["Growth", "301–800 students", ["3,000", "16,200", "30,600", "2,700", "2,550"]],
    ["Professional", "801–1,500 students", ["5,000", "27,000", "51,000", "4,500", "4,250"]],
  ] as const) {
    const card = cards.find(card => card.includes(`>${label}</h3>`));
    assert.ok(card, `Missing ${label} school-size card`);
    for (const text of [capacity, ...prices, "Half-yearly", "Yearly", "10%", "15%", "182 days", "365 days", "Sign in to renew"]) assert.ok(card.includes(text), `${label} missing ${text}`);
  }
  for (const text of ["9,999", "30 days", "pricing eligibility", "custom quote", "not available from this sign-in page"]) assert.ok(html.includes(text), `Missing ${text}`);
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map(match => match[1]);
  assert.ok(hrefs.every(href => href.startsWith("#") ? ["#top", "#school-sign-in", "#features", "#plans"].includes(href) : ["/apps", "/portal/login", "/driver/login"].includes(href)));
  assert.doesNotMatch(html, /unlimited|guaranteed uptime|24\/7|href="\/buy|href="\/download/i);
});

test("password visibility toggle preserves accessible labels and entered password", () => {
  const f = fixture(async () => Response.json({ ok: true }));
  const password = f.find(n => n.props.id === "login-password");
  (password?.props.onChange as (e: { target: { value: string } }) => void)({ target: { value: "example-only" } });
  const show = f.find(n => n.props["aria-label"] === "Show password");
  (show?.props.onClick as () => void)();
  assert.equal(f.find(n => n.props.id === "login-password")?.props.type, "text");
  assert.equal(f.find(n => n.props.id === "login-password")?.props.value, "example-only");
  const hide = f.find(n => n.props["aria-label"] === "Hide password");
  assert.equal(hide?.props["aria-pressed"], true);
  (hide?.props.onClick as () => void)();
  assert.equal(f.find(n => n.props.id === "login-password")?.props.type, "password");
});

test("login email and password have explicit labels and autofill semantics", () => {
  const f = fixture(async () => Response.json({ ok: true }));
  const email = f.find(n => n.props.type === "email");
  const password = f.find(n => n.props.type === "password");
  assert.equal(email?.props.id, "login-email");
  assert.equal(email?.props.autoComplete, "username");
  assert.equal(password?.props.id, "login-password");
  assert.equal(password?.props.autoComplete, "current-password");
  assert.ok(f.find(n => n.type === "label" && n.props.htmlFor === "login-email"));
  assert.ok(f.find(n => n.type === "label" && n.props.htmlFor === "login-password"));
});

for (const failure of ["network", "invalid-json"] as const) test(`login ${failure} shows an accessible retry error without navigation`, async () => {
  const f = fixture(async () => { if (failure === "network") throw Error("offline"); return new Response("upstream unavailable", { status: 502 }); });
  await assert.doesNotReject(f.submit);
  assert.ok(f.find(n => n.props.role === "alert"));
  assert.equal(f.find(n => n.props.type === "submit")?.props.disabled, false);
  assert.deepEqual(f.navigation, []);
});

test("login navigates only after confirmed success and suppresses concurrent submissions", async () => {
  let resolve!: (r: Response) => void;
  let calls = 0;
  const pending = new Promise<Response>(done => { resolve = done; });
  const f = fixture(async () => { calls++; return pending; });
  const first = f.submit();
  const second = f.submit();
  resolve(Response.json({ ok: true }));
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.deepEqual(f.navigation, ["/dashboard", "refresh"]);
});

test("HTTP-success without an explicit login confirmation does not navigate", async () => {
  const f = fixture(async () => Response.json({ error: "Not authenticated" }));
  await f.submit();
  assert.deepEqual(f.navigation, []);
  assert.ok(f.find(n => n.props.role === "alert"));
});
