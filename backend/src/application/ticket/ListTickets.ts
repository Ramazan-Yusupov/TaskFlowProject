import type { Ticket, TicketStatus } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";

export class ListTickets {
  constructor(private readonly ticketRepository: TicketRepository) {}

  execute(filters?: { status?: TicketStatus; query?: string }): Promise<Ticket[]> {
    return this.ticketRepository.list(filters);
  }
}
