import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

test('production deferred loader awaits async module setup before replaying first interaction', async () => {
  const source = fs.readFileSync(new URL('../src/scripts/site.ts', import.meta.url), 'utf8');
  const fn = source.slice(source.indexOf('function loadDeferred'), source.indexOf('function armDeferred'));
  const key = '__deferredBootRegressionReady';
  const dataUrl = code => 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  const boot = dataUrl(`await new Promise(resolve => setTimeout(resolve, 25)); globalThis[${JSON.stringify(key)}] = true;`);
  const code = `const DEFERRED_BOOT_URL = ${JSON.stringify(boot)}; let deferredLoad = null;\n` +
    fn.replaceAll('import.meta.env.DEV', 'false') + '\nexport { loadDeferred };';
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  try {
    const { loadDeferred } = await import(dataUrl(js));
    const first = loadDeferred();
    assert.equal(first, loadDeferred(), 'parallel taps share one initialization');
    assert.equal(globalThis[key], undefined, 'fixture setup is still pending');
    await first;
    assert.equal(globalThis[key], true, 'first interaction resumes only after top-level await');
  } finally { delete globalThis[key]; }
});
