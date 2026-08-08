#!/usr/bin/env node
/**
 * Export ARCH_DATA to data.js and schema.json (same format as WYSIWYG «Экспорт data.js»).
 * Usage: node scripts/export-data.js [input.json]
 * Without input: reads current data.js
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataJsPath = path.join(root, 'data.js');
const docsDataJsPath = path.join(root, 'docs', 'data.js');
const schemaPath = path.join(root, 'schema.json');

function loadFromDataJs() {
  const src = fs.readFileSync(dataJsPath, 'utf8');
  const fn = new Function('window', `${src}; return window.ARCH_DATA;`);
  return fn({});
}

function exportFiles(data) {
  const json = JSON.stringify(data, null, 2);
  const dataJs = `window.ARCH_DATA = ${json};\n`;

  fs.writeFileSync(dataJsPath, dataJs);
  fs.writeFileSync(docsDataJsPath, dataJs);
  fs.writeFileSync(schemaPath, `${json}\n`);

  console.log('Exported:');
  console.log('  data.js');
  console.log('  docs/data.js');
  console.log('  schema.json');
}

const input = process.argv[2];
if (input) {
  const data = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
  exportFiles(data);
} else {
  exportFiles(loadFromDataJs());
}
