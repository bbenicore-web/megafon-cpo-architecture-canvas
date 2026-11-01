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
const block = (name) => context.window.ROADMAP_DATA.blocks.find((item) => item.title === name);

assert.equal(task('Формирование БФТ').start, '2026-07-01');
assert.equal(task('Формирование CJM').start, '2026-07-01');

assert.deepEqual(
  plain(block('Core. Платформа BSS').rows.slice(-2).map((row) => row.id)),
  ['pok-combo', 'pok-zero'],
);
assert.equal(
  block('Самообслуживание. Новая линейка').rows.some((row) => row.id === 'pok-combo' || row.id === 'pok-zero'),
  false,
);

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
    end: '2026-11-01',
  },
);

assert.equal(
  task('Аналитика BSS').comment,
  'От этой задачи зависит аналитика ЦКО',
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

const css = fs.readFileSync(path.join(root, 'roadmap', 'roadmap.css'), 'utf8');
assert.match(css, /\.team\s*\{[^}]*font-size:\s*clamp\(15px,\s*0\.78vw,\s*30px\)/s);
assert.match(css, /\.task\s*\{[^}]*font-size:\s*clamp\(15px,\s*0\.78vw,\s*30px\)/s);
assert.match(css, /\.task-note\s*\{[^}]*font-size:\s*clamp\(12px,\s*0\.625vw,\s*24px\)/s);
assert.match(css, /\.role-segment span\s*\{[^}]*font-size:\s*clamp\(10px,\s*0\.52vw,\s*20px\)/s);
assert.match(css, /grid-template-columns:\s*10% 37% 48% 5%/s);
assert.match(css, /\.months span\s*\{[^}]*white-space:\s*nowrap/s);
assert.match(css, /\.team\s*\{[^}]*white-space:\s*nowrap/s);
assert.match(css, /\.release-mark span\s*\{[^}]*font-size:\s*clamp\(8px,\s*0\.42vw,\s*16px\)/s);

const renderer = fs.readFileSync(path.join(root, 'roadmap', 'render.js'), 'utf8');
assert.doesNotMatch(renderer, /task-note roles/);
assert.match(renderer, /сроки dev\+qa tbd/);
assert.match(renderer, /может сдвинуться<br>из-за оценки<br>других задач/);

console.log('Original roadmap requested adjustments: PASS');
