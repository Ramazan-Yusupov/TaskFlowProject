import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";
import { TicketNotFoundError } from "./ChangeTicketStatus.js";

export class DeleteTicket {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute(ticketId: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) throw new TicketNotFoundError("Задача не найдена.");
    await this.ticketRepository.delete(ticketId);
  }
}
