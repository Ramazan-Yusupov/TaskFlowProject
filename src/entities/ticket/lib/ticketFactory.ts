import type { CreateTicketInput, Ticket } from "../model/types";

export function getTicketInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "НЗ";
}

export function getNextLocalTicketId(tickets: Ticket[]): string {
  const highestNumber = tickets.reduce((currentHighest, ticket) => {
    const match = /^TSK-(\d+)$/.exec(ticket.id);
    return match ? Math.max(currentHighest, Number(match[1])) : currentHighest;
  }, 490);

  return `TSK-${highestNumber + 1}`;
}

export function buildLocalTicket(input: CreateTicketInput, id: string): Ticket {
  const assigneeName = input.assigneeName.trim();

  return {
    id,
    title: input.title.trim(),
    project: input.project.trim(),
    priority: input.priority,
    status: "backlog",
    labels: ["Новая"],
    assignee: { name: assigneeName, initials: getTicketInitials(assigneeName) },
    dueAt: input.dueAt,
    comments: 0,
  };
}

export function updateTicketFromInput(ticket: Ticket, input: CreateTicketInput): Ticket {
  const assigneeName = input.assigneeName.trim();

  return {
    ...ticket,
    title: input.title.trim(),
    project: input.project.trim(),
    priority: input.priority,
    assignee: { name: assigneeName, initials: getTicketInitials(assigneeName) },
    dueAt: input.dueAt,
  };
}
