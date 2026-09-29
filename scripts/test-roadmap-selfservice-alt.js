const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };

vm.runInNewContext(
  fs.readFileSync(path.join(root, 'roadmap', 'data.js'), 'utf8'),
  context,
);
const original = JSON.parse(JSON.stringify(context.window.ROADMAP_DATA));

vm.runInNewContext(
  fs.readFileSync(path.join(root, 'roadmap-selfservice-alt', 'data.js'), 'utf8'),
  context,
);
const alternate = JSON.parse(JSON.stringify(context.window.ROADMAP_DATA));

assert.equal(
  alternate.title,
  'ОРИГА 1.0 — альтернативные сроки самообслуживания',
);

const originalOutsideSelfService = original.blocks.filter(
  (block) => block.title !== 'Самообслуживание. Новая линейка',
);
const alternateOutsideSelfService = alternate.blocks.filter(
  (block) => block.title !== 'Самообслуживание. Новая линейка',
);
assert.deepEqual(alternateOutsideSelfService, originalOutsideSelfService);

const block = alternate.blocks.find(
  (item) => item.title === 'Самообслуживание. Новая линейка',
);
const task = (name) => block.rows.find((row) => row.task === name);

assert.deepEqual(
  task('ЛК: Комбо-наборы в разделах «МегаСилы» и «Чек»').roles,
  [
    { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
    { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
    { role: 'Dev', start: '2026-12-28', end: '2027-01-22' },
    { role: 'QA', start: '2027-01-25', end: '2027-02-05' },
  ],
);

assert.deepEqual(
  task('ЛК: Комбо-наборы в разделе «Услуги»').roles,
  [
    { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
    { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
  ],
);
assert.equal(task('ЛК: Комбо-наборы в разделе «Услуги»').partialTbd, true);

assert.deepEqual(
  task('ЛК: Новый экран «Мой тариф»').roles,
  [
    { role: 'UX/UI', start: '2026-11-02', end: '2026-11-20' },
    { role: 'SA', start: '2026-11-23', end: '2026-12-11' },
    { role: 'Dev', start: '2026-12-14', end: '2027-01-12' },
    { role: 'QA', start: '2027-01-13', end: '2027-01-27' },
  ],
);
assert.equal(task('ЛК: Новый экран «Мой тариф»').releaseDate, '2027-01-13');

const originalSelfService = original.blocks.find(
  (item) => item.title === 'Самообслуживание. Новая линейка',
);
for (const name of [
  'Анализ технического решения',
  'ЛК: Новая детальная страница тарифа в смене тарифа',
  'ЛК: Комбо-набор с Евой и другие услуги Евы',
  'ЛК: Комбо-набор с 5G и другие услуги 5G',
  'ЛК: Комбо-набор с МегаКино и другие услуги МегаКино',
]) {
  assert.deepEqual(
    task(name),
    originalSelfService.rows.find((row) => row.task === name),
  );
}

const page = fs.readFileSync(
  path.join(root, 'roadmap-selfservice-alt', 'index.html'),
  'utf8',
);
assert.match(
  page,
  /src="\.\.\/roadmap\/data\.js"[\s\S]*src="data\.js"[\s\S]*src="\.\.\/roadmap\/render\.js"/,
);

const navigation = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(navigation, /href="roadmap-selfservice-alt\/index\.html"/);

const renderer = fs.readFileSync(path.join(root, 'roadmap', 'render.js'), 'utf8');
assert.match(renderer, /row\.releaseDate/);

console.log('Alternate self-service roadmap: PASS');
