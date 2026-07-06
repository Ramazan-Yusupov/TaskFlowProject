# TaskFlow

Современный MVP для управления задачами команды. Проект содержит интерактивный React frontend, готовый API-контракт и минимальный backend в стиле Clean Architecture.

## Стек

- React 19 + TypeScript + Vite
- CSS design system с цветами из design audit: `#231F20`, `#F9F4DA`, `#FCBA28`, `#12B2E2`, `#0BA95B`
- Feature-Sliced-подобная структура frontend
- Node.js `http` API без framework lock-in для демонстрации backend boundaries

## Запуск

```bash
npm install
npm run dev
```

По умолчанию используется demo-режим: можно искать задачи, фильтровать их, создавать новую задачу и передвигать её по потоку.

## Связка с backend

```bash
cp .env.example .env
# укажите VITE_API_MODE=remote
npm run backend:dev
npm run dev
```

Backend поднимется на `http://localhost:4000`, а Vite перенаправит `/api` запросы через proxy.

## Проверки

```bash
npm run typecheck
npm run lint
npm run build
```

## Документация

- [Инструкции для фронтенда](docs/FRONTEND_RULES.md)
- [Правила backend](docs/BACKEND_RULES.md)
- [Общие инструкции для агентов](AGENTS.md)
- [API contract](docs/API_CONTRACT.md)

## Структура

```text
src/
  app/        # root composition
  widgets/    # dashboard header, navigation, ticket board
  features/   # create-ticket, ticket-filters
  entities/   # ticket domain model
  shared/     # UI primitives, fetch gateway, helpers
backend/src/
  domain/
  application/
  infrastructure/
  presentation/
```
