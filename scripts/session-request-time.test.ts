import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

for (const [file, getter] of [["session", "getSession"], ["portal-auth", "getPortalSession"], ["driver-auth", "getDriverSession"]] as const) {
const source = readFileSync(new URL(`../src/lib/${file}.ts`, import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

for (const token of ["fixture-token", undefined]) {
  test(`${getter} awaits request-time connection before cookies and JWT ${token ? "verification" : "absence"}`, async () => {
    const events: string[] = [];
    let release!: () => void;
    const requestReady = new Promise<void>(resolve => { release = resolve; });
    let ready = false;
    const exports: Record<string, () => Promise<unknown>> = {};
    runInNewContext(compiled, {
      exports, process: { env: {} },
      require: (name: string) => {
        if (name === "next/server") return { connection: async () => { events.push("connection"); await requestReady; ready = true; } };
        if (name === "next/headers") return { cookies: async () => { events.push("cookies"); return { get: () => ({ value: token }) }; } };
        if (name === "jsonwebtoken") return { __esModule: true, default: { verify: () => { events.push("verify"); assert.equal(ready, true); return { userId: "fixture" }; } } };
        if (name === "@/lib/auth") return { SESSION_COOKIE: "school_erp_session", verifySession: () => { events.push("verify"); assert.equal(ready, true, "JWT time reads must run after the awaited request boundary"); return { userId: "fixture" }; } };
        throw Error(`Unexpected dependency ${name}`);
      },
    });
    const pending = exports[getter]();
    const beforeRelease = [...events];
    release();
    const result = await pending;
    assert.deepEqual(beforeRelease, ["connection"], "Do not start cookies/JWT during prerender");
    assert.deepEqual(events, token ? ["connection", "cookies", "verify"] : ["connection", "cookies"]);
    assert.equal(token ? (result as { userId: string }).userId === "fixture" : result === null, true);
  });
}
}
