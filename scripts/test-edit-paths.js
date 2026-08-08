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

function cloneData(d) {
  return JSON.parse(JSON.stringify(d));
}

function deleteByPath(D, path) {
  const parts = path.split('.');
  function entityId(p) {
    const segs = p.split('.');
    if (segs.length >= 2) return segs[1];
    return null;
  }
  if (parts[parts.length - 2] === 'items') {
    const id = parts[parts.length - 1];
    let cur = D;
    for (let i = 0; i < parts.length - 2; i++) cur = resolveSegment(cur, parts[i]);
    cur.items = cur.items.filter((item) => item.id !== id);
    return true;
  }
  if (parts[0] === 'domains' && parts[2] === 'sections' && parts.length === 4) {
    let domain = D;
    for (let i = 0; i < 2; i++) domain = resolveSegment(domain, parts[i]);
    domain.sections.splice(Number(parts[3]), 1);
    return true;
  }
  if (parts[0] === 'integration') {
    D.integration = D.integration.filter((item) => item.id !== entityId(path));
    return true;
  }
  if (parts[0] === 'flowSteps') {
    D.flowSteps = D.flowSteps.filter((item) => item.id !== entityId(path));
    return true;
  }
  return false;
}

const delData = cloneData(data);
const beforeItems = delData.domains[0].sections[0].items.length;
deleteByPath(delData, 'domains.telecom.sections.0.items.t1');
console.log('Delete tile OK:', delData.domains[0].sections[0].items.length === beforeItems - 1);

const delData2 = cloneData(data);
const beforeSections = delData2.domains[0].sections.length;
deleteByPath(delData2, 'domains.telecom.sections.0');
console.log('Delete section OK:', delData2.domains[0].sections.length === beforeSections - 1);

const delData3 = cloneData(data);
deleteByPath(delData3, 'integration.i1');
console.log('Delete integration OK:', !delData3.integration.some((i) => i.id === 'i1'));

