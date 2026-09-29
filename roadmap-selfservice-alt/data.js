(function () {
  const data = window.ROADMAP_DATA;
  data.title = 'ОРИГА 1.0 — альтернативные сроки самообслуживания';

  const block = data.blocks.find(
    (item) => item.title === 'Самообслуживание. Новая линейка',
  );
  const task = (name) => block.rows.find((row) => row.task === name);

  Object.assign(
    task('ЛК: Комбо-наборы в разделах «МегаСилы» и «Чек»'),
    {
      start: '2026-11-16',
      end: '2027-02-05',
      roles: [
        { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
        { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
        { role: 'Dev', start: '2026-12-28', end: '2027-01-22' },
        { role: 'QA', start: '2027-01-25', end: '2027-02-05' },
      ],
    },
  );

  Object.assign(
    task('ЛК: Комбо-наборы в разделе «Услуги»'),
    {
      start: '2026-11-16',
      end: '2026-12-25',
      roles: [
        { role: 'UX/UI', start: '2026-11-16', end: '2026-12-04' },
        { role: 'SA', start: '2026-12-07', end: '2026-12-25' },
      ],
    },
  );

  Object.assign(
    task('ЛК: Новый экран «Мой тариф»'),
    {
      start: '2026-11-02',
      end: '2027-01-27',
      releaseDate: '2027-01-13',
      roles: [
        { role: 'UX/UI', start: '2026-11-02', end: '2026-11-20' },
        { role: 'SA', start: '2026-11-23', end: '2026-12-11' },
        { role: 'Dev', start: '2026-12-14', end: '2027-01-12' },
        { role: 'QA', start: '2027-01-13', end: '2027-01-27' },
      ],
    },
  );
})();
