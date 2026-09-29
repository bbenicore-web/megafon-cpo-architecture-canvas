window.ROADMAP_DATA = {
  title: 'ОРИГА 1.0 — роадмап проекта',
  range: 'Июль 2026 — Февраль 2027',
  scaleStart: '2026-07-01',
  scaleEnd: '2027-03-01',
  blocks: [
    {
      title: 'Core. Подготовка продукта',
      rows: [
        { team: 'Основная линейка', task: 'Формирование БФТ', start: '2026-07-01', end: '2026-09-25', requirementsOpen: true, id: 'bft' },
        { team: 'КО', task: 'Формирование CJM', start: '2026-07-01', end: '2026-09-25', requirementsOpen: true, id: 'cjm' },
        { team: 'Архитектура', task: 'Формирование архитектуры решения (ADR)', start: '2026-09-21', end: '2026-10-02' },
        { team: 'Архитектура', task: 'Формирование ТЗ', start: '2026-09-28', end: '2026-10-02' },
      ],
    },
    {
      title: 'Core. Платформа BSS',
      rows: [
        { team: 'BSS', task: 'Аналитика BSS', start: '2026-10-05', end: '2026-10-16' },
        { team: 'BSS', task: 'Конфигурирование BSS CORE', start: '2026-10-19', end: '2026-11-16', id: 'bss-core' },
        { team: 'ПОК', task: 'Настройка комбо-наборов ПОК', tbd: true, id: 'pok-combo' },
        { team: 'ПОК', task: 'Настройка нулевого профиля ПОК', tbd: true, id: 'pok-zero' },
      ],
    },
    {
      title: 'Core. Продажа Original',
      rows: [
        {
          team: 'ЦКО', task: 'САЙТ: Новая карточка тарифа', start: '2026-07-01', end: '2026-10-09',
          roles: [
            { role: 'UX/UI', start: '2026-07-01', end: '2026-08-01' },
            { role: 'Dev', start: '2026-08-01', end: '2026-09-25' },
            { role: 'Content', start: '2026-09-28', end: '2026-10-02' },
            { role: 'QA', start: '2026-10-05', end: '2026-10-09' },
          ],
        },
        {
          team: 'ЦКО', task: 'САЙТ: Новые витрины тарифов', start: '2026-08-15', end: '2026-10-16',
          roles: [
            { role: 'Dev', start: '2026-08-15', end: '2026-10-09' },
            { role: 'QA', start: '2026-10-12', end: '2026-10-16' },
          ],
        },
        {
          team: 'ЦКО', task: 'САЙТ: Новая детальная страница тарифа', start: '2026-07-01', end: '2026-12-18',
          roles: [
            { role: 'UX/UI', start: '2026-07-01', end: '2026-10-16' },
            { role: 'SA', start: '2026-10-19', end: '2026-11-06' },
            { role: 'Dev', start: '2026-11-09', end: '2026-12-04' },
            { role: 'QA', start: '2026-12-07', end: '2026-12-18' },
          ],
        },
        {
          team: 'ЦКО', task: 'ЛК: Новая карточка тарифа', start: '2026-09-14', end: '2026-10-16',
          roles: [
            { role: 'Dev', start: '2026-09-14', end: '2026-10-09' },
            { role: 'QA', start: '2026-10-12', end: '2026-10-16' },
          ],
        },
      ],
    },
    {
      title: 'Самообслуживание. Новая линейка',
      rows: [
        { team: 'ЦКО', task: 'Анализ технического решения', start: '2026-10-01', end: '2026-10-15' },
        {
          team: 'ЦКО', task: 'ЛК: Новая детальная страница тарифа в смене тарифа', start: '2026-10-19', end: '2026-12-25',
          dependsOn: ['bss-core', 'pok-combo', 'pok-zero'],
          roles: [
            { role: 'UX/UI', start: '2026-10-19', end: '2026-10-30' },
            { role: 'SA', start: '2026-11-02', end: '2026-11-20' },
            { role: 'Dev', start: '2026-11-23', end: '2026-12-11' },
            { role: 'QA', start: '2026-12-14', end: '2026-12-25' },
          ],
        },
        {
          team: 'ЦКО', task: 'ЛК: Комбо-наборы в разделах «МегаСилы» и «Чек»', start: '2026-10-05', end: '2026-12-18',
          dependsOn: ['bss-core', 'pok-combo', 'pok-zero'],
          roles: [
            { role: 'UX/UI', start: '2026-10-05', end: '2026-10-23' },
            { role: 'SA', start: '2026-10-26', end: '2026-11-13' },
            { role: 'Dev', start: '2026-11-16', end: '2026-12-04' },
            { role: 'QA', start: '2026-12-07', end: '2026-12-18' },
          ],
        },
        {
          team: 'ЦКО', task: 'ЛК: Комбо-наборы в разделе «Услуги»', start: '2026-10-05', end: '2026-11-06',
          dependsOn: ['bss-core', 'pok-combo', 'pok-zero'], partialTbd: true,
          roles: [
            { role: 'UX/UI', start: '2026-10-05', end: '2026-10-23' },
            { role: 'SA', start: '2026-10-26', end: '2026-11-06' },
          ],
        },
        {
          team: 'ЦКО', task: 'ЛК: Новый экран «Мой тариф»', start: '2026-10-19', end: '2027-01-13',
          dependsOn: ['bss-core', 'pok-combo', 'pok-zero'], release: true,
          roles: [
            { role: 'UX/UI', start: '2026-10-19', end: '2026-11-06' },
            { role: 'SA', start: '2026-11-09', end: '2026-11-27' },
            { role: 'Dev', start: '2026-11-30', end: '2026-12-18' },
            { role: 'QA', start: '2026-12-21', end: '2027-01-13' },
          ],
        },
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с Евой и другие услуги Евы', tbd: true, dependsOn: ['bft', 'cjm'] },
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с 5G и другие услуги 5G', tbd: true, dependsOn: ['bft', 'cjm'] },
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с МегаКино и другие услуги МегаКино', tbd: true, dependsOn: ['bft', 'cjm'] },
      ],
    },
    {
      title: 'Core. Качество и запуск',
      rows: [
        { team: 'ФТ', task: 'Тестирование', start: '2026-11-09', end: '2027-01-12' },
        { team: 'ФТ', task: 'Тестирование после запуска', start: '2027-01-13', end: '2027-02-10' },
      ],
    },
  ],
};
