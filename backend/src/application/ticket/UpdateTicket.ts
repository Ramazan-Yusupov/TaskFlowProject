import { getInitials, type Ticket, type TicketPriority } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";
import { TicketNotFoundError } from "./ChangeTicketStatus.js";

export type UpdateTicketCommand = {
  title: string;
  project: string;
  priority: TicketPriority;
  assigneeName: string;
  dueAt: string;
};

export class UpdateTicket {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute(ticketId: string, command: UpdateTicketCommand): Promise<Ticket> {
    const current = await this.ticketRepository.findById(ticketId);
    if (!current) throw new TicketNotFoundError("Задача не найдена.");

    const assigneeName = command.assigneeName.trim();
    const updated: Ticket = {
      ...current,
      title: command.title.trim(),
      project: command.project.trim(),
      priority: command.priority,
      assignee: { name: assigneeName, initials: getInitials(assigneeName) },
      dueAt: command.dueAt,
    };

    await this.ticketRepository.save(updated);
    return updated;
  }
}
