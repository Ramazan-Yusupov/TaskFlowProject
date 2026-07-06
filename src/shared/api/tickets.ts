import type { CreateTicketInput, Ticket, TicketPriority, TicketStatus } from "@/entities/ticket";

const apiMode = import.meta.env.VITE_API_MODE;

type ApiFailure = {
  ok: false;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export class ApiRequestError extends Error {
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.fieldErrors = fieldErrors;
  }
}

export function isRemoteApiEnabled(): boolean {
  return apiMode === "remote";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return value === "backlog" || value === "in_progress" || value === "review" || value === "done";
}

function isTicketPriority(value: unknown): value is TicketPriority {
  return value === "low" || value === "medium" || value === "high" || value === "urgent";
}

function parseTicket(value: unknown): Ticket {
  if (!isRecord(value) || !isRecord(value.assignee)) {
    throw new ApiRequestError("Сервер вернул неожиданный формат задачи.");
  }

  const id = value.id;
  const title = value.title;
  const project = value.project;
  const status = value.status;
  const priority = value.priority;
  const labels = value.labels;
  const dueAt = value.dueAt;
  const comments = value.comments;
  const assigneeName = value.assignee.name;
  const assigneeInitials = value.assignee.initials;

  const isValid = typeof id === "string"
    && typeof title === "string"
    && typeof project === "string"
    && isTicketStatus(status)
    && isTicketPriority(priority)
    && Array.isArray(labels)
    && labels.every((label) => typeof label === "string")
    && typeof assigneeName === "string"
    && typeof assigneeInitials === "string"
    && typeof dueAt === "string"
    && typeof comments === "number";

  if (!isValid) {
    throw new ApiRequestError("Сервер вернул неполные данные задачи.");
  }

  return {
    id,
    title,
    project,
    status,
    priority,
    labels,
    assignee: { name: assigneeName, initials: assigneeInitials },
    dueAt,
    comments,
  };
}

function parseFailure(value: unknown): ApiFailure | null {
  if (!isRecord(value) || value.ok !== false || typeof value.message !== "string" || typeof value.code !== "string") {
    return null;
  }

  const fieldErrors: Record<string, string[]> = {};
  if (isRecord(value.fieldErrors)) {
    for (const [field, errors] of Object.entries(value.fieldErrors)) {
      if (Array.isArray(errors) && errors.every((item) => typeof item === "string")) {
        fieldErrors[field] = errors;
      }
    }
  }

  return {
    ok: false,
    code: value.code,
    message: value.message,
    ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
  };
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (response.status === 204) return undefined;

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = parseFailure(body);
    throw new ApiRequestError(failure?.message ?? "Не удалось выполнить запрос. Попробуйте ещё раз.", failure?.fieldErrors);
  }

  return body;
}

export async function getTickets(): Promise<Ticket[] | null> {
  if (!isRemoteApiEnabled()) return null;

  const response = await request("/api/tickets");
  if (!Array.isArray(response)) throw new ApiRequestError("Сервер вернул неожиданный формат списка задач.");
  return response.map(parseTicket);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket | null> {
  if (!isRemoteApiEnabled()) return null;
  return parseTicket(await request("/api/tickets", { method: "POST", body: JSON.stringify(input) }));
}

export async function updateTicket(ticketId: string, input: CreateTicketInput): Promise<Ticket | null> {
  if (!isRemoteApiEnabled()) return null;
  return parseTicket(await request(`/api/tickets/${encodeURIComponent(ticketId)}`, { method: "PATCH", body: JSON.stringify(input) }));
}

export async function changeTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket | null> {
  if (!isRemoteApiEnabled()) return null;
  return parseTicket(await request(`/api/tickets/${encodeURIComponent(ticketId)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }));
}

export async function deleteTicket(ticketId: string): Promise<void> {
  if (!isRemoteApiEnabled()) return;
  await request(`/api/tickets/${encodeURIComponent(ticketId)}`, { method: "DELETE" });
}
