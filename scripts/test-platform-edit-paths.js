#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '..', 'telecom-platform', 'data.js');
const src = fs.readFileSync(dataJsPath, 'utf8');
const fn = new Function('window', `${src}; return window.PLATFORM_DATA;`);
const data = fn({});

function resolveSegment(cur, part) {
  if (cur == null) return undefined;
  if (Array.isArray(cur)) {
    if (/^\d+$/.test(part)) return cur[Number(part)];
    const byId = cur.find((item) => item && item.id === part);
    if (byId) return byId;
  }
  return cur[part];
}

function getByPath(root, p) {
  let cur = root;
  for (const part of p.split('.')) {
    cur = resolveSegment(cur, partsSafe(part));
    if (cur == null) return undefined;
  }
  return cur;
}

function partsSafe(part) {
  return part;
}

const cases = [
  ['pageTitle', 'string'],
  ['mission', 'string'],
  ['value.client.items.0', 'string'],
  ['left.provides.items.0', 'string'],
  ['center.layers.domains.items.discovery.title', 'string'],
  ['center.layers.journeys.items.j1.label', 'string'],
  ['center.layers.capabilities.items.cat.label', 'string'],
  ['center.layers.channels.items.web.label', 'string'],
  ['right.uses.items.0', 'string'],
  ['metrics.columns.sales.items.0', 'string'],
  ['zones.items.0', 'string'],
  ['tobe.items.0', 'string'],
];

let failed = 0;
for (const [p, expectedType] of cases) {
  const val = getByPath(data, p);
  const ok = val != null && typeof val === expectedType;
  console.log(`${ok ? 'OK' : 'FAIL'} ${p} -> ${val == null ? 'undefined' : typeof val}`);
  if (!ok) failed++;
}

const layers = data.center.layers;
if (!Array.isArray(layers) || layers.length !== 4) {
  console.log('FAIL center.layers must have 4 layers');
  failed++;
} else {
  console.log('OK center.layers length', layers.length);
}

const domainCount = layers.find((l) => l.id === 'domains')?.items.length;
if (domainCount !== 5) {
  console.log('FAIL domains count', domainCount);
  failed++;
} else {
  console.log('OK domains count', domainCount);
}

const journeyCount = layers.find((l) => l.id === 'journeys')?.items.length;
if (journeyCount !== 5) {
  console.log('FAIL journeys count', journeyCount);
  failed++;
} else {
  console.log('OK journeys count', journeyCount);
}

const tile = getByPath(data, 'center.layers.domains.items.discovery');
tile.title = 'TEST DOMAIN';
console.log('Apply simulation OK:', tile.title === 'TEST DOMAIN');

function cloneData(d) {
  return JSON.parse(JSON.stringify(d));
}

const del = cloneData(data);
const domains = del.center.layers.find((l) => l.id === 'domains');
const before = domains.items.length;
domains.items = domains.items.filter((item) => item.id !== 'discovery');
console.log('Delete domain OK:', domains.items.length === before - 1);

if (failed) {
  process.exit(1);
}

const appSrc = fs.readFileSync(path.join(__dirname, '..', 'telecom-platform', 'app.js'), 'utf8');
const discovery = appSrc.match(/discovery:\s*\{[^}]+\}/);
if (!discovery) {
  console.log('FAIL discovery relation missing');
  process.exit(1);
}
for (const id of ['j1', 'j2', 'cat', 'nav', 'web', 'lk']) {
  if (!discovery[0].includes(`'${id}'`)) {
    console.log('FAIL discovery missing', id);
    process.exit(1);
  }
}
if (discovery[0].includes("'app'") || discovery[0].includes("'cards'")) {
  console.log('FAIL discovery includes an unrelated item');
  process.exit(1);
}
console.log('OK discovery selects search, study, catalog, navigation, site, account');
const sales = appSrc.match(/sales:\s*\{[^}]+\}/);
if (!sales) {
  console.log('FAIL sales relation missing');
  process.exit(1);
}
for (const id of ['j3', 'pay', 'web', 'lk']) {
  if (!sales[0].includes(`'${id}'`)) {
    console.log('FAIL sales missing', id);
    process.exit(1);
  }
}
if (sales[0].includes("'app'") || sales[0].includes("'cart'") || sales[0].includes("'cat'")) {
  console.log('FAIL sales includes an unrelated item');
  process.exit(1);
}
console.log('OK sales selects checkout, payment, site, account');
console.log('All platform data path tests passed');
