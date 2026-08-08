#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '..', 'data.js');
const src = fs.readFileSync(dataJsPath, 'utf8');
const fn = new Function('window', `${src}; return window.ARCH_DATA;`);
const data = fn({});

const DEFAULT_UI = {
  pageTitle: 'MegaFon CPO Architecture',
  pageSubtitle: 'Интерактивная архитектура CPO-структуры цифрового продукта МегаФона',
  panels: {
    business: 'БИЗНЕС-ЗАКАЗЧИКИ',
    platformWhy: 'ЗАЧЕМ ПЛАТФОРМА',
    platformMetrics: 'СВЯЗЬ С БИЗНЕСОМ',
    integration: 'ИНТЕГРАЦИЯ И ВЗАИМОДЕЙСТВИЕ ПЛАТФОРМ',
    teams: 'КОМАНДА ТЕЛЕКОМ ПЛАТФОРМЫ',
    flow: '1. Модель взаимодействия',
    roles: '2. Описание ролей и зон ответственности',
    raci: 'Легенда RACI',
  },
  business: {
    leadersHint: '↓ управляет CPO направлениями',
    cpoSubtitle: 'CPO продуктовых направлений',
    cpoHint: 'Запросы от CPO направлений → платформа Telecom',
  },
  platformWhyText:
    'Платформа даёт общие capabilities — каталоги, поиск, навигацию, профиль и сервисы — всем доменам. Новые продукты запускаются быстрее и выглядят единообразно.',
  digitalCpoBadge: 'Платформа',
  sidebarZonePrefix: 'ЗОНА · ',
  sidebarZoneHint: 'Наведите на колонку платформы или откройте блок «2. Описание ролей» ниже.',
  statusDefault: 'Кликните на элемент схемы или наведите на колонку платформы',
  raciLegend: 'R — исполняет · A — отвечает · C — консультирует · I — информируется',
  raciHeaders: ['Зона', 'Head Telecom', 'Head CX', 'Head VAS', 'Platform', 'Product (P&L)'],
  hiddenBlocks: [],
};

function mergeUi(current) {
  if (!current) return JSON.parse(JSON.stringify(DEFAULT_UI));
  const out = JSON.parse(JSON.stringify(DEFAULT_UI));
  for (const [k, v] of Object.entries(current)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k]) Object.assign(out[k], v);
    else out[k] = v;
  }
  return out;
}

data.ui = mergeUi(data.ui);

const json = JSON.stringify(data, null, 2);
const body = `window.ARCH_DATA = ${json};\n`;
fs.writeFileSync(dataJsPath, body);
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'data.js'), body);
fs.writeFileSync(path.join(__dirname, '..', 'schema.json'), `${json}\n`);
console.log('ui block ensured in data.js, docs/data.js, schema.json');
