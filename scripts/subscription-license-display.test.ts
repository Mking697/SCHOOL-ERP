import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

type Element = { type: unknown; props: { children?: unknown; licensed?: boolean } };
const code = ts.transpileModule(readFileSync(new URL('../src/app/(app)/layout.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
for (const [online, offline, expected] of [[true, false, true], [null, true, true], [null, false, false]] as const) {
  test(`layout license display online=${online} offline=${offline} is ${expected}`, async () => {
    const topbar = () => null;
    const exports: { default?: (props: { children: null }) => Promise<Element> } = {};
    const jsx = (type: unknown, props: Element['props']) => ({ type, props });
    runInNewContext(code, {
      exports, Date,
      require: (name: string) => {
        if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
        if (name === 'next/navigation') return { redirect: () => { throw Error('Unexpected redirect'); } };
        if (name === '@/lib/session') return { getSession: async () => ({ email: 'qa@example.test', role: 'ADMIN' }) };
        if (name === '@/lib/db') return { prisma: { school: { findFirst: async () => ({ name: 'Fixture', license: offline ? { isActive: true, expiresAt: null } : null }) } } };
        if (name === '@/lib/subscription') return { checkSubscription: async () => online === null ? null : ({ active: online, pricingTier: 'STARTER' }) };
        if (name === '@/components/layout/topbar') return { Topbar: topbar };
        if (name === '@/components/layout/sidebar') return { Sidebar: () => null };
        if (name === '@/components/subscription-gate') return { __esModule: true, default: () => null };
        throw Error(`Unexpected import ${name}`);
      },
    });
    function find(value: unknown): Element | undefined {
      if (!value || typeof value !== 'object' || !('props' in value)) return;
      const e = value as Element;
      if (e.type === topbar) return e;
      for (const child of Array.isArray(e.props.children) ? e.props.children : [e.props.children]) { const result = find(child); if (result) return result; }
    }
    const result = find(await exports.default!({ children: null }));
    assert.ok(result);
    assert.equal(result.props.licensed, expected, 'A paid online subscriber must not be shown an Unlicensed warning solely for lacking a legacy offline key');
  });
}
