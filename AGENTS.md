# TaskFlow engineering instructions

Используй эти правила при любом изменении проекта:

- Frontend: [`docs/FRONTEND_RULES.md`](docs/FRONTEND_RULES.md)
- Backend: [`docs/BACKEND_RULES.md`](docs/BACKEND_RULES.md)
- Интеграция API: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)

## Общее правило

Сначала изучи текущую структуру и связанный модуль. Вноси минимальное изменение, сохраняя публичные контракты. Не создавай мёртвый код или абстракции «на будущее». После реализации запускай `npm run typecheck`, `npm run lint` и `npm run build`.

## Границы системы

- Frontend хранит UI, пользовательские сценарии и API-gateway в `src/`.
- Backend хранит domain/application/infrastructure/presentation в `backend/src/`.
- Сетевое взаимодействие описано в `docs/API_CONTRACT.md`.
- Backend не зависит от React/Vite; frontend не знает об in-memory storage или серверных деталях.
