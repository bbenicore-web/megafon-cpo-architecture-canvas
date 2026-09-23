#!/usr/bin/env node
/**
 * Export PLATFORM_DATA to telecom-platform/data.js and schema.json.
 * Usage: node scripts/export-platform-data.js [input.json]
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'telecom-platform');
const dataJsPath = path.join(root, 'data.js');
const schemaPath = path.join(root, 'schema.json');

function loadFromDataJs() {
  const src = fs.readFileSync(dataJsPath, 'utf8');
  const fn = new Function('window', `${src}; return window.PLATFORM_DATA;`);
  return fn({});
}

function exportFiles(data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(dataJsPath, `window.PLATFORM_DATA = ${json};\n`);
  fs.writeFileSync(schemaPath, `${json}\n`);
  console.log('Exported:');
  console.log('  telecom-platform/data.js');
  console.log('  telecom-platform/schema.json');
}

const input = process.argv[2];
if (input) {
  exportFiles(JSON.parse(fs.readFileSync(path.resolve(input), 'utf8')));
} else {
  exportFiles(loadFromDataJs());
}
