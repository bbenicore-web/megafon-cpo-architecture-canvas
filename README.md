# MegaFon CPO Architecture Canvas

Интерактивная архитектурная схема CPO-структуры цифрового продукта МегаФона: платформенные домены (Telecom, CX, VAS), бизнес-заказчики, команды, RACI и зоны ответственности.

## Открытие в Cursor

1. Клонируйте репозиторий.
2. Откройте папку проекта в Cursor.
3. Откройте файл [canvases/megafon-cpo-architecture.canvas.tsx](canvases/megafon-cpo-architecture.canvas.tsx) — Canvas откроется рядом с чатом.

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

Статическая версия схемы публикуется автоматически из папки `docs/` при push в `main`.

- Сайт: **https://bbenicore-web.github.io/megafon-cpo-architecture-canvas/**
- Workflow: `.github/workflows/pages.yml`

Интерактивная версия с фокусом и выбором элементов — в Cursor Canvas (`canvases/megafon-cpo-architecture.canvas.tsx`).
