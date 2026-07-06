import type { TicketPriority, TicketStatus } from "../model/types";

export const statusMeta: Record<TicketStatus, { label: string; className: string }> = {
  backlog: { label: "Бэклог", className: "status--backlog" },
  in_progress: { label: "В работе", className: "status--progress" },
  review: { label: "Проверка", className: "status--review" },
  done: { label: "Готово", className: "status--done" },
};

export const priorityMeta: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: "Низкий", className: "priority--low" },
  medium: { label: "Средний", className: "priority--medium" },
  high: { label: "Высокий", className: "priority--high" },
  urgent: { label: "Срочный", className: "priority--urgent" },
};
