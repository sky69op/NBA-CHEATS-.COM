import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const localeSource = fs.readFileSync(new URL('../src/i18n/locales.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(localeSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { LOCALES, DEFAULT_LOCALE } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

test('all configured translation dictionaries contain the English source keys', () => {
  const source = ts.createSourceFile('en.ts', fs.readFileSync(new URL('../src/i18n/en.ts', import.meta.url), 'utf8'), ts.ScriptTarget.Latest, true);
  let english;
  const find = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'en') english = node.initializer;
    ts.forEachChild(node, find);
  };
  find(source); assert.ok(english);
  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    const dictionary = JSON.parse(fs.readFileSync(new URL(`../src/i18n/dictionaries/${locale}.json`, import.meta.url), 'utf8'));
    const pageSeo = JSON.parse(fs.readFileSync(new URL(`../src/i18n/pageSeo/${locale}.json`, import.meta.url), 'utf8'));
    const check = (node, value, label) => {
      if (ts.isObjectLiteralExpression(node)) for (const prop of node.properties) {
        const key = prop.name?.text;
        if (!key || !prop.initializer) continue;
        assert.ok(value && key in value, `${locale}: missing ${label}.${key}`);
        check(prop.initializer, value[key], label + '.' + key);
      }
      if (ts.isArrayLiteralExpression(node) && Array.isArray(value)) node.elements.forEach((item, i) => {
        if (i < value.length) check(item, value[i], label + '[' + i + ']');
      });
    };
    check(english, { ...dictionary, pageSeo }, 'dictionary');
  }
});
