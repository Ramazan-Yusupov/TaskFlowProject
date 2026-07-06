# TaskFlow API contract — MVP

Frontend работает автономно в режиме `VITE_API_MODE=demo`. Для интеграции установите `VITE_API_MODE=remote`, запустите backend на `http://localhost:4000` и Vite proxy направит `/api` на него.

Backend хранит рабочие данные в `backend/.data/tickets.json`. Этот файл создаётся автоматически при первом запуске и не попадает в Git.

## Endpoints

### `GET /health`

Возвращает `{ "status": "ok" }`.

### `GET /api/tickets?status=&query=`

Возвращает массив задач. `status` — один из `backlog`, `in_progress`, `review`, `done`. `query` ищет по id, заголовку, проекту и исполнителю.

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

Ответ `201` — созданная задача.

### `PATCH /api/tickets/:ticketId`

Принимает те же редактируемые поля, что и создание. Ответ `200` — обновлённая задача.

### `PATCH /api/tickets/:ticketId/status`

```json
{ "status": "review" }
```

Ответ `200` — обновлённая задача. Допустим только следующий статус потока: `backlog → in_progress → review → done`. Некорректный переход возвращает `409` с `code: "INVALID_STATUS_TRANSITION"`.

### `DELETE /api/tickets/:ticketId`

Удаляет задачу. Ответ `204` без тела.

## Ошибки

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Проверьте поля формы.",
  "fieldErrors": { "title": ["Введите не менее 5 символов."] }
}
```

Тело запроса ограничено 100 KB. Превышение возвращает `413` и `PAYLOAD_TOO_LARGE`.
