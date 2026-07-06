import type { Ticket, TicketPriority, TicketStatus } from "./types";

const TICKET_STORAGE_KEY = "taskflow-tickets";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return value === "backlog" || value === "in_progress" || value === "review" || value === "done";
}

function isTicketPriority(value: unknown): value is TicketPriority {
  return value === "low" || value === "medium" || value === "high" || value === "urgent";
}

function isTicket(value: unknown): value is Ticket {
  if (!isRecord(value) || !isRecord(value.assignee)) return false;

  return typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.project === "string"
    && isTicketStatus(value.status)
    && isTicketPriority(value.priority)
    && Array.isArray(value.labels)
    && value.labels.every((label) => typeof label === "string")
    && typeof value.assignee.name === "string"
    && typeof value.assignee.initials === "string"
    && typeof value.dueAt === "string"
    && typeof value.comments === "number";
}

export function readStoredTickets(): Ticket[] | null {
  try {
    const raw = window.localStorage.getItem(TICKET_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isTicket) ? parsed : null;
  } catch {
    return null;
  }
}

export function storeTickets(tickets: Ticket[]): void {
  try {
    window.localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Browser storage is an optional offline cache; mutations continue in memory.
  }
}
