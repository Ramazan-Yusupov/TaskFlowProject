import type { IncomingMessage, ServerResponse } from "node:http";
import {
  ChangeTicketStatus,
  InvalidTicketStatusError,
  InvalidTicketStatusTransitionError,
  TicketNotFoundError,
} from "../../application/ticket/ChangeTicketStatus.js";
import { CreateTicket } from "../../application/ticket/CreateTicket.js";
import { DeleteTicket } from "../../application/ticket/DeleteTicket.js";
import { ListTickets } from "../../application/ticket/ListTickets.js";
import { UpdateTicket, type UpdateTicketCommand } from "../../application/ticket/UpdateTicket.js";
import { isTicketPriority, isTicketStatus, type TicketPriority } from "../../domain/ticket/Ticket.js";
import { getPath, readJsonBody, sendError, sendJson, sendNoContent } from "./http.js";

type TicketRouterDependencies = {
  createTicket: CreateTicket;
  listTickets: ListTickets;
  updateTicket: UpdateTicket;
  deleteTicket: DeleteTicket;
  changeTicketStatus: ChangeTicketStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTicketCommand(input: unknown): { command?: UpdateTicketCommand; fieldErrors?: Record<string, string[]> } {
  if (!isRecord(input)) return { fieldErrors: { form: ["Проверьте поля формы."] } };

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const project = typeof input.project === "string" ? input.project.trim() : "";
  const assigneeName = typeof input.assigneeName === "string" ? input.assigneeName.trim() : "";
  const dueAt = typeof input.dueAt === "string" ? input.dueAt : "";
  const priority = typeof input.priority === "string" ? input.priority : "";
  const parsedPriority = isTicketPriority(priority) ? priority : null;
  const fieldErrors: Record<string, string[]> = {};

  if (title.length < 5) fieldErrors.title = ["Введите не менее 5 символов."];
  if (!project) fieldErrors.project = ["Выберите направление работы."];
  if (!assigneeName) fieldErrors.assigneeName = ["Укажите исполнителя."];
  if (!dueAt) fieldErrors.dueAt = ["Выберите срок выполнения."];
  if (!parsedPriority) fieldErrors.priority = ["Выберите допустимый приоритет."];

  if (Object.keys(fieldErrors).length || !parsedPriority) return { fieldErrors };

  return { command: { title, project, assigneeName, dueAt, priority: parsedPriority as TicketPriority } };
}

function handleUnexpectedError(response: ServerResponse, error: unknown, fallbackMessage: string): void {
  if (error instanceof TicketNotFoundError) sendError(response, 404, "NOT_FOUND", error.message);
  else if (error instanceof InvalidTicketStatusError || error instanceof InvalidTicketStatusTransitionError) sendError(response, 409, "INVALID_STATUS_TRANSITION", error.message);
  else if (error instanceof Error && error.message === "INVALID_JSON") sendError(response, 400, "INVALID_JSON", "Некорректный JSON.");
  else if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") sendError(response, 413, "PAYLOAD_TOO_LARGE", "Размер запроса превышает допустимый лимит.");
  else sendError(response, 500, "UNEXPECTED_ERROR", fallbackMessage);
}

export async function routeTickets(request: IncomingMessage, response: ServerResponse, dependencies: TicketRouterDependencies): Promise<boolean> {
  const path = getPath(request);

  if (request.method === "GET" && path === "/api/tickets") {
    const url = new URL(request.url ?? "/", "http://localhost");
    const status = url.searchParams.get("status") ?? undefined;
    if (status && !isTicketStatus(status)) {
      sendError(response, 400, "VALIDATION_ERROR", "Статус фильтра недопустим.");
      return true;
    }
    const parsedStatus = status && isTicketStatus(status) ? status : undefined;
    sendJson(response, 200, await dependencies.listTickets.execute({ status: parsedStatus, query: url.searchParams.get("query") ?? undefined }));
    return true;
  }

  if (request.method === "POST" && path === "/api/tickets") {
    try {
      const parsed = parseTicketCommand(await readJsonBody(request));
      if (!parsed.command) {
        sendError(response, 400, "VALIDATION_ERROR", "Проверьте поля формы.", parsed.fieldErrors);
        return true;
      }
      sendJson(response, 201, await dependencies.createTicket.execute(parsed.command));
    } catch (error) {
      handleUnexpectedError(response, error, "Не удалось создать задачу.");
    }
    return true;
  }

  const ticketMatch = path.match(/^\/api\/tickets\/([^/]+)$/);
  if (request.method === "PATCH" && ticketMatch) {
    try {
      const parsed = parseTicketCommand(await readJsonBody(request));
      if (!parsed.command) {
        sendError(response, 400, "VALIDATION_ERROR", "Проверьте поля формы.", parsed.fieldErrors);
        return true;
      }
      sendJson(response, 200, await dependencies.updateTicket.execute(decodeURIComponent(ticketMatch[1]), parsed.command));
    } catch (error) {
      handleUnexpectedError(response, error, "Не удалось обновить задачу.");
    }
    return true;
  }

  if (request.method === "DELETE" && ticketMatch) {
    try {
      await dependencies.deleteTicket.execute(decodeURIComponent(ticketMatch[1]));
      sendNoContent(response);
    } catch (error) {
      handleUnexpectedError(response, error, "Не удалось удалить задачу.");
    }
    return true;
  }

  const statusMatch = path.match(/^\/api\/tickets\/([^/]+)\/status$/);
  if (request.method === "PATCH" && statusMatch) {
    try {
      const input = await readJsonBody(request);
      const status = isRecord(input) && typeof input.status === "string" ? input.status : "";
      sendJson(response, 200, await dependencies.changeTicketStatus.execute(decodeURIComponent(statusMatch[1]), status));
    } catch (error) {
      handleUnexpectedError(response, error, "Не удалось обновить задачу.");
    }
    return true;
  }

  return false;
}
