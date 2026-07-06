import { TICKET_PRIORITIES, type TicketPriority } from "@/entities/ticket";

export function isTicketPriority(value: string): value is TicketPriority {
  return TICKET_PRIORITIES.some((priority) => priority === value);
}
