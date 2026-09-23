# MegaFon CPO Architecture Canvas

Интерактивная архитектурная схема CPO-структуры цифрового продукта МегаФона: платформенные домены (Telecom, CX, VAS), бизнес-заказчики, команды, RACI и зоны ответственности.

## Открытие в Cursor

1. Клонируйте репозиторий.
2. Откройте папку проекта в Cursor.
3. Откройте файл [canvases/megafon-cpo-architecture.canvas.tsx](canvases/megafon-cpo-architecture.canvas.tsx) — Canvas откроется рядом с чатом.
4. Вторая схема: [canvases/telecom-digital-platform.canvas.tsx](canvases/telecom-digital-platform.canvas.tsx).

## Содержание схемы

- **Бизнес-заказчики** — лидеры Телеком Core и Витрины, CPO продуктовых направлений
- **CPO цифрового продукта** — Личный кабинет и Сайт
- **Платформенные домены** — Telecom Core, CX, VAS / Partners
- **Интеграция и взаимодействие** — сквозные capabilities
- **Команда телеком платформы** — направления и продуктовые команды
- **Модель взаимодействия** — поток от бизнес-запросов к платформенным CPO
- **Роли и зоны ответственности** — Digital, Telecom, CX, VAS CPO
- **RACI** — матрица ответственности

## Требования

- [Cursor](https://cursor.com) с поддержкой Canvas
- Файл `.canvas.tsx` компилируется IDE автоматически при открытии

## Публикация на GitHub

Локальный git-репозиторий уже инициализирован. Для создания удалённого репозитория и push:

```bash
chmod +x scripts/publish-github.sh
./scripts/publish-github.sh
```

## GitHub Pages

Интерактивная версия схемы публикуется автоматически при push в `main` из корня репозитория (`index.html`, `app.js`, `data.js`, `styles.css`).

- CPO-схема: **https://bbenicore-web.github.io/megafon-cpo-architecture-canvas/**
- Telecom Digital Platform: **https://bbenicore-web.github.io/megafon-cpo-architecture-canvas/telecom-platform/**
- Workflow: `.github/workflows/pages.yml` (копирует корневые файлы и `telecom-platform/` в `_site` и деплоит через GitHub Actions)

**Интерактивность на Pages:**
- режим фокуса и подсветка колонок платформ
- выбор CPO направлений и бизнес-лидеров
- кликабельные плитки сервисов и сценариев
- фильтр RACI
- выбор шагов модели взаимодействия и зон ответственности

Полная версия с Cursor Canvas — `canvases/megafon-cpo-architecture.canvas.tsx`.

## Telecom Digital Platform

Отдельная схема Telecom Digital Experience Platform: бизнес владеет оффером, платформа — путём клиента. Слои: потоки ценности, клиентский путь, capabilities, каналы, зоны ответственности, AS-IS и «Куда хотим».

- Страница: `telecom-platform/index.html`
- WYSIWYG: `telecom-platform/index.html?edit=1` или [Pages с `?edit=1`](https://bbenicore-web.github.io/megafon-cpo-architecture-canvas/telecom-platform/?edit=1)
- Данные: `telecom-platform/data.js`
- Canvas: `canvases/telecom-digital-platform.canvas.tsx`

Редактор тот же по смыслу: клик по элементу, панель справа, черновик в localStorage, экспорт `data.js`.

## WYSIWYG-редактор

Схему можно редактировать визуально в браузере — без правки кода.

1. Откройте страницу с параметром **`?edit=1`**:
   - локально: `index.html?edit=1`
   - на GitHub Pages: `https://bbenicore-web.github.io/megafon-cpo-architecture-canvas/?edit=1`
2. **Кликните** на любой элемент схемы — справа откроется панель редактирования.
3. **Sidebar «ЗОНА»** — включите «Закрепить динамику» (включено по умолчанию), выберите зону в dropdown и кликните блок для редактирования.
4. **Удаление блоков** — кнопка «Удалить» в панели (плитки, секции, CPO, команды, шаги flow, зоны ролей, RACI, интеграции, метрики). У секций доменов также есть кнопка «× Секцию».
5. Используйте кнопки **«+ Добавить элемент»** в секциях доменов, интеграции и RACI.
6. **Сохранить черновик** — данные сохраняются в localStorage браузера.
7. **Экспорт JSON** или **Экспорт data.js** — скачайте файл и замените `data.js` в репозитории, чтобы опубликовать изменения.

> Изменения на GitHub Pages не попадают в репозиторий автоматически — после редактирования экспортируйте `data.js` и сделайте commit.
