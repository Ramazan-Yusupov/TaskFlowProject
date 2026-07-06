import type { Ticket, TicketStatus } from "./Ticket.js";

export interface TicketRepository {
  list(filters?: { status?: TicketStatus; query?: string }): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<void>;
}
