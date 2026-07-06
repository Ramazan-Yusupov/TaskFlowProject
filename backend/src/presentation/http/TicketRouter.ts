import type { IncomingMessage, ServerResponse } from "node:http";
import { ChangeTicketStatus, InvalidTicketStatusError, TicketNotFoundError } from "../../application/ticket/ChangeTicketStatus.js";
import { CreateTicket } from "../../application/ticket/CreateTicket.js";
import { ListTickets } from "../../application/ticket/ListTickets.js";
import { isTicketPriority, isTicketStatus } from "../../domain/ticket/Ticket.js";
import { getPath, readJsonBody, sendError, sendJson } from "./http.js";

type TicketRouterDependencies = { createTicket: CreateTicket; listTickets: ListTickets; changeTicketStatus: ChangeTicketStatus };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
      const input = await readJsonBody(request);
      if (!isRecord(input)) {
        sendError(response, 400, "VALIDATION_ERROR", "Проверьте поля формы.");
        return true;
      }
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
      if (Object.keys(fieldErrors).length || !parsedPriority) {
        sendError(response, 400, "VALIDATION_ERROR", "Проверьте поля формы.", fieldErrors);
        return true;
      }
      sendJson(response, 201, await dependencies.createTicket.execute({ title, project, assigneeName, dueAt, priority: parsedPriority }));
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_JSON") sendError(response, 400, "INVALID_JSON", "Некорректный JSON.");
      else sendError(response, 500, "UNEXPECTED_ERROR", "Не удалось создать задачу.");
    }
    return true;
  }

  const match = path.match(/^\/api\/tickets\/([^/]+)\/status$/);
  if (request.method === "PATCH" && match) {
    try {
      const input = await readJsonBody(request);
      const status = isRecord(input) && typeof input.status === "string" ? input.status : "";
      sendJson(response, 200, await dependencies.changeTicketStatus.execute(match[1], status));
    } catch (error) {
      if (error instanceof InvalidTicketStatusError) sendError(response, 400, "VALIDATION_ERROR", error.message);
      else if (error instanceof TicketNotFoundError) sendError(response, 404, "NOT_FOUND", error.message);
      else if (error instanceof Error && error.message === "INVALID_JSON") sendError(response, 400, "INVALID_JSON", "Некорректный JSON.");
      else sendError(response, 500, "UNEXPECTED_ERROR", "Не удалось обновить задачу.");
    }
    return true;
  }

  return false;
}
