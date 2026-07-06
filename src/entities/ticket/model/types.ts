export const TICKET_STATUSES = ["backlog", "in_progress", "review", "done"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export type Ticket = {
  id: string;
  title: string;
  project: string;
  status: TicketStatus;
  priority: TicketPriority;
  labels: string[];
  assignee: {
    name: string;
    initials: string;
  };
  dueAt: string;
  comments: number;
};

export type CreateTicketInput = {
  title: string;
  project: string;
  priority: TicketPriority;
  assigneeName: string;
  dueAt: string;
};
