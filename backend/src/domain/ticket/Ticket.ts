export const ticketStatuses = ["backlog", "in_progress", "review", "done"] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export type Ticket = {
  id: string;
  title: string;
  project: string;
  priority: TicketPriority;
  status: TicketStatus;
  labels: string[];
  assignee: { name: string; initials: string };
  dueAt: string;
  comments: number;
};

const nextStatus: Record<TicketStatus, TicketStatus | null> = {
  backlog: "in_progress",
  in_progress: "review",
  review: "done",
  done: null,
};

export function isTicketStatus(value: string): value is TicketStatus {
  return ticketStatuses.includes(value as TicketStatus);
}

export function isTicketPriority(value: string): value is TicketPriority {
  return ticketPriorities.includes(value as TicketPriority);
}

export function canChangeTicketStatus(currentStatus: TicketStatus, targetStatus: TicketStatus): boolean {
  return nextStatus[currentStatus] === targetStatus;
}

export function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "НЗ";
}
