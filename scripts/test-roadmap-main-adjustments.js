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

const rows = context.window.ROADMAP_DATA.blocks.flatMap((block) => block.rows);
const task = (name) => rows.find((row) => row.task === name);
const plain = (value) => JSON.parse(JSON.stringify(value));

assert.deepEqual(
  plain(task('САЙТ: Новая карточка тарифа').roles),
  [
    { role: 'UX/UI', start: '2026-07-01', end: '2026-08-01' },
    { role: 'Dev', start: '2026-08-01', end: '2026-09-25' },
    { role: 'Content', start: '2026-09-28', end: '2026-10-02' },
    { role: 'QA', start: '2026-10-05', end: '2026-10-09' },
  ],
);

assert.equal(task('САЙТ: Новые витрины тарифов').start, '2026-08-15');
assert.equal(task('САЙТ: Новые витрины тарифов').roles[0].start, '2026-08-15');

assert.equal(task('САЙТ: Новая детальная страница тарифа').start, '2026-07-01');
assert.equal(task('САЙТ: Новая детальная страница тарифа').roles[0].start, '2026-07-01');

assert.deepEqual(
  plain(task('Анализ технического решения')),
  {
    team: 'ЦКО',
    task: 'Анализ технического решения',
    start: '2026-10-01',
    end: '2026-10-15',
  },
);

assert.deepEqual(
  plain(task('ЛК: Комбо-наборы в разделах «МегаСилы» и «Чек»').roles),
  [
    { role: 'UX/UI', start: '2026-10-05', end: '2026-10-23' },
    { role: 'SA', start: '2026-10-26', end: '2026-11-13' },
    { role: 'Dev', start: '2026-11-16', end: '2026-12-04' },
    { role: 'QA', start: '2026-12-07', end: '2026-12-18' },
  ],
);

assert.deepEqual(
  plain(task('ЛК: Комбо-наборы в разделе «Услуги»').roles),
  [
    { role: 'UX/UI', start: '2026-10-05', end: '2026-10-23' },
    { role: 'SA', start: '2026-10-26', end: '2026-11-06' },
  ],
);

console.log('Original roadmap requested adjustments: PASS');
