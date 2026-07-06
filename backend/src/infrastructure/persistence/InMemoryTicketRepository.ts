import type { Ticket, TicketStatus } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";
import { seedTickets } from "./seedTickets.js";

export class InMemoryTicketRepository implements TicketRepository {
  private readonly tickets: Map<string, Ticket>;

  constructor(initialTickets: Ticket[] = seedTickets) {
    this.tickets = new Map(initialTickets.map((ticket) => [ticket.id, ticket]));
  }

  async list(filters?: { status?: TicketStatus; query?: string }): Promise<Ticket[]> {
    const query = filters?.query?.trim().toLocaleLowerCase("ru-RU");
    return [...this.tickets.values()].filter((ticket) => {
      const matchesStatus = !filters?.status || ticket.status === filters.status;
      const searchable = `${ticket.id} ${ticket.title} ${ticket.project} ${ticket.assignee.name}`.toLocaleLowerCase("ru-RU");
      return matchesStatus && (!query || searchable.includes(query));
    });
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) ?? null;
  }

  async save(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id, ticket);
  }

  async delete(id: string): Promise<void> {
    this.tickets.delete(id);
  }
}
