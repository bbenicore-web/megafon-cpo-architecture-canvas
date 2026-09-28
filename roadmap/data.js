window.ROADMAP_DATA = {
  title: 'ОРИГА 1.0 — роадмап проекта',
  range: 'Сентябрь 2026 — Февраль 2027',
  scaleStart: '2026-09-01',
  scaleEnd: '2027-03-01',
  blocks: [
    {
      title: 'Core. Подготовка продукта',
      rows: [
        { team: 'Основная линейка', task: 'Формирование БФТ', start: '2026-09-14', end: '2026-09-25', requirementsOpen: true },
        { team: 'КО', task: 'Формирование CJM', start: '2026-09-17', end: '2026-09-21', requirementsOpen: true },
        { team: 'Архитектура', task: 'Формирование архитектуры решения (ADR)', start: '2026-09-21', end: '2026-10-02' },
        { team: 'Архитектура', task: 'Формирование ТЗ', start: '2026-09-28', end: '2026-10-02' },
      ],
    },
    {
      title: 'Core. Платформа BSS',
      rows: [
        { team: 'BSS', task: 'Аналитика BSS', start: '2026-10-05', end: '2026-10-16' },
        { team: 'BSS', task: 'Конфигурирование BSS CORE', start: '2026-10-19', end: '2026-11-16', id: 'bss-core' },
      ],
    },
    {
      title: 'Core. Продажа Original',
      rows: [
        { team: 'ЦКО', task: 'САЙТ: Новая карточка тарифа', start: '2026-09-14', end: '2026-10-09' },
        { team: 'ЦКО', task: 'САЙТ: Новые витрины тарифов', start: '2026-09-21', end: '2026-10-23' },
        { team: 'ЦКО', task: 'САЙТ: Новая детальная страница тарифа', start: '2026-09-14', end: '2026-12-11' },
        { team: 'ЦКО', task: 'ЛК: Новая карточка тарифа', start: '2026-09-14', end: '2026-10-23' },
      ],
    },
    {
      title: 'Core. Подключенный продукт',
      rows: [
        { team: 'ЦКО', task: 'Аналитика архитектуры решения', start: '2026-10-05', end: '2026-10-15' },
        { team: 'ЦКО', task: 'ЛК: Новая детальная страница тарифа', start: '2026-10-19', end: '2026-12-25', dependsOn: ['bss-core', 'pok-combo', 'pok-zero'] },
        { team: 'ЦКО', task: 'ЛК: Новый экран «Мой тариф»', start: '2026-11-30', end: '2027-02-05', dependsOn: ['bss-core', 'pok-combo', 'pok-zero'] },
        { team: 'ЦКО', task: 'ЛК: Комбо-наборы в разделах: Мегасилы, услуги, чек', start: '2026-11-09', end: '2027-01-06', dependsOn: ['bss-core', 'pok-combo', 'pok-zero'] },
        { team: 'ПОК', task: 'Настройка комбо-наборов ПОК', tbd: true, id: 'pok-combo' },
        { team: 'ПОК', task: 'Настройка нулевого профиля ПОК', tbd: true, id: 'pok-zero' },
        { team: 'КС', task: 'Клиентский сервис: настройка сегмента без доработок', tbd: true },
      ],
    },
    {
      title: 'Сложные услуги. Продукт',
      rows: [
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с Евой и другие услуги Евы', tbd: true, dependsOn: 'bss-core' },
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с 5G и другие услуги 5G', tbd: true, dependsOn: 'bss-core' },
        { team: 'ЦКО', task: 'ЛК: Комбо-набор с МегаКино и другие услуги МегаКино', tbd: true, dependsOn: 'bss-core' },
      ],
    },
    {
      title: 'Core. Качество и запуск',
      rows: [
        { team: 'ФТ', task: 'Тестирование', start: '2026-11-09', end: '2026-12-30' },
        { team: 'ФТ', task: 'Тестирование после запуска', start: '2027-01-11', end: '2027-01-26', later: true },
      ],
    },
  ],
};
