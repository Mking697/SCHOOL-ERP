import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const scratch = join(homedir(), 'AppData/Local/hermes/cache/scratch');
mkdirSync(scratch, { recursive: true });
const installer = readFileSync(new URL('../install.ps1', import.meta.url), 'utf8');
const good = { version: 1, purchaseId: 'purchase_fixture', schoolName: 'Fixture School', vendorUrl: 'https://billing.example.test', schoolApiKey: 'fixture_customer_key_1234567890', pricingTier: 'STARTER' };
function fixture(enrollment: unknown = good) {
  const dir = mkdtempSync(join(scratch, 'school-installer-'));
  writeFileSync(join(dir, 'install.ps1'), installer);
  if (enrollment !== null) writeFileSync(join(dir, 'school-enrollment.json'), JSON.stringify(enrollment));
  const run = (port = '31888') => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', join(dir, 'install.ps1'), '-AppPort', port, '-ConfigureOnly'], { encoding: 'utf8', timeout: 15000 });
  return { dir, run, close: () => rmSync(dir, { recursive: true, force: true }) };
}
function assertRejectedBeforeSecrets(enrollment: unknown, manifest?: unknown) {
  const f = fixture(enrollment);
  try {
    if (manifest !== undefined) writeFileSync(join(f.dir, 'manifest.json'), JSON.stringify(manifest));
    writeFileSync(join(f.dir, 'install.ps1'), installer.replace('$dbPassword = New-RandomHex 24', 'throw "SECRET_GENERATION_REACHED"'));
    const r = f.run();
    assert.notEqual(r.status, 0);
    assert.equal(existsSync(join(f.dir, '.env')), false);
    assert.ok(!`${r.stdout}${r.stderr}`.includes('SECRET_GENERATION_REACHED'), 'validation must precede secret generation');
    assert.match(`${r.stdout}${r.stderr}`, /enrollment|manifest/i);
    assert.ok(!`${r.stdout}${r.stderr}`.includes(good.schoolApiKey), 'school key must stay private');
  } finally { f.close(); }
}
for (const mode of ['test', 'live', '', null, 1, true, [], ['TEST'], { mode: 'LIVE' }]) {
  test(`installer rejects non-exact enrollment mode ${JSON.stringify(mode)} before secrets`, () => {
    assertRejectedBeforeSecrets({ ...good, paymentMode: mode });
  });
}
const liveManifest = { formatVersion: 1, product: 'School ERP', paymentMode: 'LIVE', testOnly: false };
for (const [label, manifest] of [
  ['missing', undefined], ['null', null], ['array', [liveManifest]],
  ['wrong version', { ...liveManifest, formatVersion: 2 }],
  ['string version', { ...liveManifest, formatVersion: '1' }],
  ['wrong product case', { ...liveManifest, product: 'school erp' }],
  ['missing mode', { formatVersion: 1, product: 'School ERP', testOnly: false }],
  ['lowercase mode', { ...liveManifest, paymentMode: 'live' }],
  ['null mode', { ...liveManifest, paymentMode: null }],
  ['array mode', { ...liveManifest, paymentMode: ['LIVE'] }],
  ['TEST mismatch', { ...liveManifest, paymentMode: 'TEST', testOnly: true }],
  ['contradictory testOnly', { ...liveManifest, testOnly: true }],
  ['string testOnly', { ...liveManifest, testOnly: 'false' }],
  ['missing testOnly', { formatVersion: 1, product: 'School ERP', paymentMode: 'LIVE' }],
] as const) test(`LIVE installer rejects ${label} manifest before secrets`, () => {
  assertRejectedBeforeSecrets({ ...good, paymentMode: 'LIVE' }, manifest);
});
for (const vendorUrl of ['http://localhost:3004', 'http://127.0.0.1:3004', 'http://[::1]:3004', 'https://billing.example.test/path', 'https://billing.example.test?x=1', 'https://billing.example.test/#x', 'https://billing.example.test/../', ' https://billing.example.test', 'https://billing.example.test\\']) {
  test(`LIVE installer rejects noncanonical vendor URL ${JSON.stringify(vendorUrl)} before secrets`, () => {
    assertRejectedBeforeSecrets({ ...good, paymentMode: 'LIVE', vendorUrl }, liveManifest);
  });
}
for (const [label, enrollment, manifest, mode] of [
  ['LIVE HTTPS', { ...good, paymentMode: 'LIVE' }, liveManifest, 'LIVE'],
  ['legacy TEST without manifest', good, undefined, 'TEST'],
  ['legacy TEST with legacy manifest', good, { formatVersion: 1, product: 'School ERP', testOnly: true }, 'TEST'],
  ['explicit TEST with explicit manifest', { ...good, paymentMode: 'TEST' }, { ...liveManifest, paymentMode: 'TEST', testOnly: true }, 'TEST'],
  ['legacy TEST loopback HTTP', { ...good, vendorUrl: 'http://127.0.0.1:3004' }, undefined, 'TEST'],
] as const) test(`installer accepts ${label} with truthful mode copy and private credentials`, () => {
  const f = fixture(enrollment);
  try {
    if (manifest !== undefined) writeFileSync(join(f.dir, 'manifest.json'), JSON.stringify(manifest));
    const r = f.run();
    assert.equal(r.status, 0, 'ConfigureOnly must succeed');
    assert.match(r.stdout, new RegExp(`School ERP ${mode} enrollment configuration created`));
    assert.match(r.stdout, /not payment proof or production readiness/i);
    assert.match(r.stdout, /NOT started/);
    const env = readFileSync(join(f.dir, '.env'), 'utf8');
    assert.ok(/^RAZORPAY_KEY_ID=\r?$/m.test(env), 'parent fee key ID stays blank');
    assert.ok(/^RAZORPAY_KEY_SECRET=\r?$/m.test(env), 'parent fee secret stays blank');
    assert.ok(!env.includes('ADMIN_PASSWORD'), 'no default admin');
    for (const name of ['PGPASSWORD', 'JWT_SECRET', 'SCHOOL_API_KEY']) {
      const value = env.split(/\r?\n/).find(line => line.startsWith(`${name}=`))?.slice(name.length + 1);
      assert.ok(value && value !== '***', `${name} must survive private readback`);
      assert.ok(!`${r.stdout}${r.stderr}`.includes(value), `${name} must not reach stdout/stderr`);
    }
  } finally { f.close(); }
});
for (const [label, manifest] of [
  ['LIVE manifest', liveManifest],
  ['legacy false testOnly', { formatVersion: 1, product: 'School ERP', testOnly: false }],
  ['explicit TEST false testOnly', { ...liveManifest, paymentMode: 'TEST' }],
  ['lowercase TEST mode', { ...liveManifest, paymentMode: 'test', testOnly: true }],
  ['numeric mode', { ...liveManifest, paymentMode: 1, testOnly: true }],
  ['object mode', { ...liveManifest, paymentMode: { mode: 'TEST' }, testOnly: true }],
  ['numeric testOnly', { ...liveManifest, paymentMode: 'TEST', testOnly: 1 }],
] as const) test(`legacy TEST installer rejects ${label} before secrets`, () => {
  assertRejectedBeforeSecrets(good, manifest);
});
for (const content of ['{broken json', '[]', '[null]']) test(`installer rejects malformed manifest ${JSON.stringify(content)} before config`, () => {
  const f = fixture();
  try {
    writeFileSync(join(f.dir, 'manifest.json'), content);
    const r = f.run();
    assert.notEqual(r.status, 0);
    assert.equal(existsSync(join(f.dir, '.env')), false);
    assert.match(`${r.stdout}${r.stderr}`, /manifest/i);
  } finally { f.close(); }
});
test('LIVE installer preserves existing configuration byte-for-byte', () => {
  const f = fixture({ ...good, paymentMode: 'LIVE' });
  try {
    writeFileSync(join(f.dir, 'manifest.json'), JSON.stringify(liveManifest));
    const original = Buffer.from('PRESERVED=original\r\n');
    writeFileSync(join(f.dir, '.env'), original);
    assert.notEqual(f.run().status, 0);
    assert.ok(readFileSync(join(f.dir, '.env')).equals(original));
  } finally { f.close(); }
});
test('installer generates independent secrets for fresh configurations', () => {
  const a = fixture(); const b = fixture();
  try {
    assert.equal(a.run().status, 0); assert.equal(b.run().status, 0);
    const first = readFileSync(join(a.dir, '.env'), 'utf8');
    const second = readFileSync(join(b.dir, '.env'), 'utf8');
    for (const name of ['PGPASSWORD', 'JWT_SECRET']) {
      const get = (env: string) => env.split(/\r?\n/).find(line => line.startsWith(`${name}=`));
      assert.ok(get(first) !== get(second), `${name} must be fresh`);
    }
  } finally { a.close(); b.close(); }
});
test('paid installer ConfigureOnly creates private per-install config with enrollment and does not claim running services', () => {
  const f = fixture();
  try {
    const r = f.run();
    assert.equal(r.status, 0, r.stderr || r.stdout);
    const env = readFileSync(join(f.dir, '.env'), 'utf8');
    assert.ok(/^VENDOR_SERVER_URL=https:\/\/billing.example.test\/?$/m.test(env), 'vendor URL must match');
    assert.ok(env.includes(`SCHOOL_API_KEY=${good.schoolApiKey}`), 'enrollment key must match');
    assert.ok(/^PGPASSWORD=[a-f0-9]{48}$/m.test(env), 'database password must be generated');
    assert.ok(/^JWT_SECRET=[a-f0-9]{96}$/m.test(env), 'JWT secret must be generated');
    assert.ok(!env.includes('DATABASE_URL='));
    assert.ok(!env.includes('SEED_ADMIN_PASSWORD='));
    assert.ok(!r.stdout.includes(good.schoolApiKey));
    assert.match(r.stdout, /NOT started/i);
  } finally { f.close(); }
});
test('paid installer never overwrites an existing configuration', () => {
  const f = fixture();
  try {
    const original = 'PRESERVED_FIXTURE_CONFIG=do-not-overwrite\n';
    writeFileSync(join(f.dir, '.env'), original);
    const r = f.run();
    assert.notEqual(r.status, 0);
    assert.equal(readFileSync(join(f.dir, '.env'), 'utf8'), original);
    assert.match(r.stderr + r.stdout, /existing|already/i);
  } finally { f.close(); }
});
for (const [label, enrollment] of [
  ['missing enrollment', null], ['bad version', { ...good, version: 2 }],
  ['insecure remote URL', { ...good, vendorUrl: 'http://billing.example.test' }],
  ['URL credentials', { ...good, vendorUrl: 'https://user:fixture@billing.example.test' }],
  ['injected school key', { ...good, schoolApiKey: 'fixture_key\nSEED_ADMIN_PASSWORD=fixture' }],
] as const) test(`paid installer rejects ${label} before writing config`, () => {
  const f = fixture(enrollment);
  try {
    const r = f.run();
    assert.notEqual(r.status, 0);
    assert.equal(existsSync(join(f.dir, '.env')), false);
    assert.match(r.stderr + r.stdout, /enrollment|configuration/i);
  } finally { f.close(); }
});
