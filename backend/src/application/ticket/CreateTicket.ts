import { getInitials, type Ticket, type TicketPriority } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";
import type { IdGenerator } from "../shared/IdGenerator.js";

export type CreateTicketCommand = {
  title: string;
  project: string;
  priority: TicketPriority;
  assigneeName: string;
  dueAt: string;
};

export class CreateTicket {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(command: CreateTicketCommand): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.idGenerator.next(),
      title: command.title.trim(),
      project: command.project,
      priority: command.priority,
      status: "backlog",
      labels: ["Новая"],
      assignee: { name: command.assigneeName.trim(), initials: getInitials(command.assigneeName) },
      dueAt: command.dueAt,
      comments: 0,
    };

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}
