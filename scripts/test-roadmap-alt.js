const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const pageDir = path.join(root, 'roadmap-no-extra-resources');
const dataPath = path.join(pageDir, 'data.js');
const indexPath = path.join(pageDir, 'index.html');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), context);

const data = context.window.ROADMAP_DATA;
assert.ok(data.title.includes('без дополнительных ресурсов'));
assert.equal(data.range, 'Июль 2026 — Февраль 2027');

const rows = data.blocks.flatMap((block) => block.rows);
const task = (name) => rows.find((row) => row.task === name);
const plain = (value) => JSON.parse(JSON.stringify(value));

assert.deepEqual(
  plain(task('ЛК: Новый экран «Мой тариф»').roles),
  [
    { role: 'UX/UI', start: '2026-11-02', end: '2026-11-20' },
    { role: 'SA', start: '2026-11-23', end: '2026-12-11' },
    { role: 'Dev', start: '2026-12-14', end: '2027-01-12' },
    { role: 'QA', start: '2027-01-13', end: '2027-01-29' },
  ],
);
assert.equal(task('ЛК: Новый экран «Мой тариф»').releaseDate, '2027-01-13');

assert.deepEqual(
  plain(task('ЛК: Комбо-наборы в разделах «МегаСилы» и «Чек»').roles),
  [
    { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
    { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
    { role: 'Dev', start: '2026-12-28', end: '2027-01-22' },
    { role: 'QA', start: '2027-01-25', end: '2027-02-05' },
  ],
);

const services = task('ЛК: Комбо-наборы в разделе «Услуги»');
assert.equal(services.partialTbd, true);
assert.deepEqual(
  plain(services.roles),
  [
    { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
    { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
  ],
);

assert.equal(task('Тестирование после запуска').end, '2027-02-26');

const index = fs.readFileSync(indexPath, 'utf8');
assert.match(index, /href="\.\.\/roadmap\/roadmap\.css"/);
assert.match(index, /src="data\.js"/);
assert.match(index, /src="\.\.\/roadmap\/render\.js"/);

const navigation = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(navigation, /href="roadmap-no-extra-resources\/index\.html"/);

console.log('Alternate roadmap data and page wiring: PASS');
