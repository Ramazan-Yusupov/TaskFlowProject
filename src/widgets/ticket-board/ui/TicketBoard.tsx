import { ArrowUpRight, CheckCircle2, ChevronRight, CircleDotDashed, Clock3, MessageCircle, MoreHorizontal } from "lucide-react";
import type { Ticket, TicketStatus } from "@/entities/ticket";
import { priorityMeta, statusMeta } from "@/entities/ticket";
import { formatShortDate } from "@/shared/lib/formatDate";
import { IconButton } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

type TicketBoardProps = {
  tickets: Ticket[];
  onStatusChange: (ticketId: string, status: TicketStatus) => Promise<void>;
};

const nextStatus: Record<TicketStatus, TicketStatus> = {
  backlog: "in_progress",
  in_progress: "review",
  review: "done",
  done: "done",
};

function TaskIcon({ status }: { status: TicketStatus }) {
  if (status === "done") return <CheckCircle2 size={20} aria-hidden="true" />;
  if (status === "in_progress") return <Clock3 size={20} aria-hidden="true" />;
  return <CircleDotDashed size={20} aria-hidden="true" />;
}

export function TicketBoard({ tickets, onStatusChange }: TicketBoardProps) {
  if (!tickets.length) {
    return (
      <section className="empty-state">
        <div className="empty-state__icon"><CircleDotDashed size={25} aria-hidden="true" /></div>
        <h2>Таких задач пока нет</h2>
        <p>Измените фильтры или создайте новую задачу для команды.</p>
      </section>
    );
  }

  return (
    <section className="ticket-board" aria-label="Список задач">
      <div className="ticket-board__head">
        <span>Задача</span><span>Проект</span><span>Приоритет</span><span>Исполнитель</span><span>Срок</span><span aria-label="Действия" />
      </div>
      <ul className="ticket-list">
        {tickets.map((ticket) => {
          const isComplete = ticket.status === "done";
          return (
            <li className="ticket-row" key={ticket.id}>
              <div className="ticket-main">
                <button
                  className={cn("task-status-button", `task-status-button--${ticket.status}`)}
                  type="button"
                  aria-label={isComplete ? "Задача выполнена" : `Перевести задачу в статус «${statusMeta[nextStatus[ticket.status]].label}»`}
                  disabled={isComplete}
                  onClick={() => void onStatusChange(ticket.id, nextStatus[ticket.status])}
                >
                  <TaskIcon status={ticket.status} />
                </button>
                <div className="ticket-title-block">
                  <div className="ticket-id">{ticket.id}</div>
                  <strong>{ticket.title}</strong>
                  <div className="ticket-labels">{ticket.labels.map((label) => <span key={label}>{label}</span>)}</div>
                </div>
              </div>
              <div className="ticket-project"><span className="project-dot project-dot--yellow" />{ticket.project}</div>
              <span className={cn("priority", priorityMeta[ticket.priority].className)}><i />{priorityMeta[ticket.priority].label}</span>
              <div className="ticket-assignee"><span className="avatar">{ticket.assignee.initials}</span><span>{ticket.assignee.name}</span></div>
              <div className="ticket-due"><span>{formatShortDate(ticket.dueAt)}</span><small><MessageCircle size={14} aria-hidden="true" />{ticket.comments}</small></div>
              <div className="ticket-actions">
                <IconButton label={`Открыть ${ticket.id}`} className="row-action"><ArrowUpRight size={18} aria-hidden="true" /></IconButton>
                <IconButton label={`Меню ${ticket.id}`} className="row-action"><MoreHorizontal size={19} aria-hidden="true" /></IconButton>
              </div>
            </li>
          );
        })}
      </ul>
      <button className="load-more" type="button">Показать ещё <ChevronRight size={17} aria-hidden="true" /></button>
    </section>
  );
}
