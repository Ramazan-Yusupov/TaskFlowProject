import type { CreateTicketInput, Ticket, TicketStatus } from "@/entities/ticket";

const apiMode = import.meta.env.VITE_API_MODE;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new Error("Не удалось выполнить запрос. Попробуйте ещё раз.");
  }

  return (await response.json()) as T;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket | null> {
  if (apiMode !== "remote") return null;

  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function changeTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket | null> {
  if (apiMode !== "remote") return null;

  return request<Ticket>(`/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
