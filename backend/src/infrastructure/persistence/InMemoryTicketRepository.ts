import type { Ticket, TicketStatus } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";

const seed: Ticket[] = [
  { id: "TSK-482", title: "Согласовать сценарий onboarding для новых клиентов", project: "Product design", status: "in_progress", priority: "high", labels: ["UX", "Клиенты"], assignee: { name: "Мадина Ахметова", initials: "МА" }, dueAt: "2026-07-08", comments: 6 },
  { id: "TSK-476", title: "Подготовить API-контракт для центра уведомлений", project: "Core platform", status: "review", priority: "urgent", labels: ["Backend", "API"], assignee: { name: "Илья Носов", initials: "ИН" }, dueAt: "2026-07-07", comments: 3 },
];

export class InMemoryTicketRepository implements TicketRepository {
  private readonly tickets = new Map(seed.map((ticket) => [ticket.id, ticket]));

  async list(filters?: { status?: TicketStatus; query?: string }): Promise<Ticket[]> {
    const query = filters?.query?.trim().toLocaleLowerCase("ru-RU");
    return [...this.tickets.values()].filter((ticket) => {
      const matchesStatus = !filters?.status || ticket.status === filters.status;
      const searchable = `${ticket.id} ${ticket.title}`.toLocaleLowerCase("ru-RU");
      return matchesStatus && (!query || searchable.includes(query));
    });
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) ?? null;
  }

  async save(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id, ticket);
  }
}
