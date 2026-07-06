# Backend engineering rules

> Версия 1.0. Этот документ дополняет frontend-правила проекта и обязателен для каждого backend-модуля TaskFlow.

## 1. Цель и порядок работы

Backend должен быть production-ready: предсказуемым, проверяемым, безопасным и независимым от HTTP, базы данных и конкретного фреймворка в доменной логике.

Перед изменением кода:

1. Изучи существующий use case, доменные типы, API-контракт и тесты.
2. Найди существующий port, repository, policy или value object для повторного использования.
3. Внеси минимальное изменение, сохраняющее внешний контракт.
4. Валидируй вход на границе, проверяй права в application layer и фиксируй результат в тестах.
5. Запусти typecheck, lint, unit/integration tests и build; честно укажи пропущенные проверки.

Принцип: **одна бизнес-операция — один use case; один источник данных — один port; инфраструктура не диктует бизнес-правила.**

## 2. Архитектура и направление зависимостей

Используй Clean Architecture:

```text
backend/src/
  domain/          # entities, value objects, domain policies, repository interfaces
  application/     # use cases, commands, query models, ports, authorization checks
  infrastructure/  # DB adapters, cache, queue, email, file storage, external APIs
  presentation/    # HTTP routes/controllers, DTO parsing, response mapping
```

Разрешённое направление:

```text
presentation → application → domain
infrastructure → application/domain
```

Запрещено импортировать `presentation` или `infrastructure` в `domain` и `application`. Entity не должна знать об ORM, Express/Fastify/Nest, SQL, HTTP-кодах, JWT или env.

## 3. Границы слоёв

- **Domain:** инварианты и чистые правила. Здесь нет запросов в БД, логирования, сетевых вызовов и контроллеров.
- **Application:** оркестрация use case, авторизация, транзакционные границы, вызов ports.
- **Infrastructure:** адаптеры для репозиториев, транзакций, событий, cache, внешних сервисов.
- **Presentation:** runtime validation DTO, преобразование HTTP в command/query и безопасное отображение ошибок.

Контроллер не содержит бизнес-логику. Он обязан лишь распарсить input, извлечь identity, вызвать use case и отобразить результат.

## 4. Use cases, ports и именование

Use case описывает действие домена: `CreateTicket`, `AssignTicket`, `ChangeTicketStatus`, `AddComment`, `ListTickets`.

Каждый use case получает явный input и зависимости через constructor. Доступ к данным идёт через интерфейсы/ports: `TicketRepository`, `Clock`, `IdGenerator`, `EventPublisher`. Не создавай id через `Math.random()` внутри use case; инъецируй `IdGenerator`.

```ts
export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<void>;
}
```

Не называй модули `utils`, `manager`, `handler`, `service` без предметного смысла. Называй действие глаголом, тип — существительным, порт — по роли.

## 5. API, validation и ошибки

- Любой request body, path/query param, header, webhook и внешний JSON проходят runtime validation на границе.
- Не доверяй userId, role, tenantId или permission из body: identity берётся из авторизованного контекста.
- API возвращает стабильную форму ошибок: `code`, `message`, при необходимости `fieldErrors` и безопасный `requestId`.
- Не выдавай stack trace, SQL/ORM ошибки, токены, адреса инфраструктуры или персональные данные.
- Версионируй публичные breaking changes (`/api/v1`) или сохраняй обратную совместимость через mapping.

## 6. Авторизация и multi-tenancy

Любая mutation и чтение приватных данных проверяют:

1. пользователь аутентифицирован;
2. tenant/workspace определён на сервере;
3. субъект имеет нужную permission;
4. объект принадлежит нужному tenant;
5. решение зафиксировано до выполнения side effect.

RBAC/permissions — policy в application/domain. Middleware/guard может извлечь identity, но не заменяет object-level access check.

## 7. Persistence и транзакции

- Repository возвращает domain model или query model, а не ORM entity наружу.
- Миграции являются версионированными, обратимыми при возможности и проверяются на чистой БД.
- Транзакция охватывает только согласованную business mutation.
- Внешние side effects (email, queue, analytics) публикуются после коммита через outbox/event-механику, когда это критично.
- Индексы добавляются на реальные фильтры, foreign keys и сортировки, а не «на всякий случай».

## 8. Безопасность и надёжность

Обязательно: allow-list CORS, rate limiting для auth/public endpoints, ограничение тела запросов, проверка MIME/размера файлов, parameterized queries, secrets только в env/secret manager, ротация refresh token, защищённое логирование.

Mutation с сетевыми повторами должна иметь idempotency key, если повтор приведёт к дублю (платёж, приглашение, уведомление, создание внешнего ресурса).

## 9. Наблюдаемость

Логи структурированные: `requestId`, action, actorId (при необходимости хешированный), tenantId, duration, outcome. Не логируй пароль, JWT, cookies, содержимое приватных комментариев и загруженные файлы.

Ошибки дели на validation, authorization, not found, conflict, rate limit и unexpected error. Метрики измеряют latency, error rate и domain-события.

## 10. Тесты и обязательные проверки

Покрывай unit-тестами: domain policies, переходы статусов, validation, access checks, mapping. Integration-тестами: repository, transactions, route + use case. E2E: вход, создание задачи, смена статуса, запрет чужого workspace.

После изменений:

```bash
npm run typecheck
npm run lint
npm run build
npm run backend:typecheck
```

Не заявляй, что backend готов к production, пока миграции, auth, observability и integration tests не внедрены.
