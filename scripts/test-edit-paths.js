#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '..', 'data.js');
const src = fs.readFileSync(dataJsPath, 'utf8');
const fn = new Function('window', `${src}; return window.ARCH_DATA;`);
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
    cur = resolveSegment(cur, part);
    if (cur == null) return undefined;
  }
  return cur;
}

const cases = [
  ['businessLeaders.telecom-core.label', 'string'],
  ['cpoRoles.cpo-main.label', 'string'],
  ['domains.telecom.cpoTitle', 'string'],
  ['domains.telecom.sections.0.items.t1', 'object'],
  ['integration.i1', 'object'],
  ['teams.tariffs.label', 'string'],
  ['flowSteps.leaders', 'object'],
  ['roleZones.digital', 'object'],
  ['raci.0', 'object'],
  ['metrics.0', 'object'],
  ['digitalCpoTitle', 'string'],
];

let failed = 0;
for (const [p, expectedType] of cases) {
  const val = getByPath(data, p);
  const ok = val != null && typeof val === expectedType;
  console.log(`${ok ? 'OK' : 'FAIL'} ${p} -> ${val == null ? 'undefined' : typeof val}`);
  if (!ok) failed++;
}

if (failed) {
  process.exit(1);
}

// simulate apply on tile
const tile = getByPath(data, 'domains.telecom.sections.0.items.t1');
tile.label = 'TEST LABEL';
console.log('Apply simulation OK:', tile.label);
