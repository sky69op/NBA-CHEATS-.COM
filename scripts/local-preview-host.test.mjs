import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLocalPreviewHost, parseHostname } from './local-preview-host.mjs';

test('parseHostname strips ports without breaking IPv6', () => {
  assert.equal(parseHostname('localhost:3000'), 'localhost');
  assert.equal(parseHostname('127.0.0.1:3000'), '127.0.0.1');
  assert.equal(parseHostname('[::1]:3000'), '::1');
  assert.equal(parseHostname('::1'), '::1');
  assert.equal(parseHostname('example.com'), 'example.com');
});

test('loopback and LAN hosts stay local', () => {
  for (const host of [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '::1',
    '[::1]:3000',
    '192.168.1.20:3000',
    '10.0.0.8',
    '172.16.0.4',
    'app.localhost',
    'project.pages.dev',
    'preview.workers.dev',
  ]) {
    assert.equal(isLocalPreviewHost(host), true, host);
  }
});

test('public hosts are not treated as local preview', () => {
  for (const host of ['example.com', 'www.example.com', 'mw4cheat.net', 'www.mw4cheat.net']) {
    assert.equal(isLocalPreviewHost(host), false, host);
  }
});
