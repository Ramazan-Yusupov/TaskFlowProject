import { canChangeTicketStatus, isTicketStatus, type Ticket } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";

export class TicketNotFoundError extends Error {}
export class InvalidTicketStatusError extends Error {}
export class InvalidTicketStatusTransitionError extends Error {}

export class ChangeTicketStatus {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute(ticketId: string, status: string): Promise<Ticket> {
    if (!isTicketStatus(status)) throw new InvalidTicketStatusError("Неизвестный статус задачи.");
    const current = await this.ticketRepository.findById(ticketId);
    if (!current) throw new TicketNotFoundError("Задача не найдена.");
    if (!canChangeTicketStatus(current.status, status)) {
      throw new InvalidTicketStatusTransitionError("Задачу можно перевести только на следующий этап потока.");
    }

    const updated: Ticket = { ...current, status };
    await this.ticketRepository.save(updated);
    return updated;
  }
}
