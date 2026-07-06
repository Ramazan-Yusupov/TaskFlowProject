# TaskFlow API contract — MVP

Frontend работает автономно в режиме `VITE_API_MODE=demo`. Для интеграции установите `VITE_API_MODE=remote`, запустите backend на `http://localhost:4000` и Vite proxy направит `/api` на него.

## Endpoints

### `GET /health`

Возвращает `{ "status": "ok" }`.

### `GET /api/tickets?status=&query=`

Возвращает массив задач. `status` — один из `backlog`, `in_progress`, `review`, `done`. `query` ищет по id и заголовку.

### `POST /api/tickets`

```json
{
  "title": "Подготовить релизный чек-лист",
  "project": "Core platform",
  "priority": "high",
  "assigneeName": "Илья Носов",
  "dueAt": "2026-07-10"
}
```

Ответ `201` — созданная задача. При ошибке валидации — `400`:

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Проверьте поля формы.",
  "fieldErrors": { "title": ["Введите не менее 5 символов."] }
}
```

### `PATCH /api/tickets/:ticketId/status`

```json
{ "status": "review" }
```

Ответ `200` — обновлённая задача. Неизвестная задача — `404`, недопустимый status — `400`.

> MVP использует in-memory adapter. В production его заменяет Postgres adapter, реализующий тот же `TicketRepository` port.
