export { initialTickets } from "./model/mockTickets";
export { TICKET_PRIORITIES, TICKET_STATUSES } from "./model/types";
export type { CreateTicketInput, Ticket, TicketPriority, TicketStatus } from "./model/types";
export { priorityMeta, statusMeta } from "./lib/ticketMeta";
export { buildLocalTicket, getNextLocalTicketId, getTicketInitials, updateTicketFromInput } from "./lib/ticketFactory";
export { validateTicketInput } from "./lib/validateTicketInput";
export type { TicketFormErrors } from "./lib/validateTicketInput";
export { readStoredTickets, storeTickets } from "./model/ticketStorage";
