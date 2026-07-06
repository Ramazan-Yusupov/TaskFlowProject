import { useMemo, useState } from "react";
import { ArrowUpRight, CircleCheckBig, Clock3, ListTodo } from "lucide-react";
import { initialTickets, type CreateTicketInput, type Ticket, type TicketStatus } from "@/entities/ticket";
import { createTicket, changeTicketStatus } from "@/shared/api/tickets";
import { CreateTicketModal } from "@/features/create-ticket";
import { TicketFilters } from "@/features/ticket-filters";
import { DashboardHeader } from "@/widgets/dashboard-header";
import { SideNavigation } from "@/widgets/side-navigation";
import { TicketBoard } from "@/widgets/ticket-board";

function buildLocalTicket(input: CreateTicketInput, order: number): Ticket {
  const normalizedName = input.assigneeName.trim();
  const initials = normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "НЗ";

  return {
    id: `TSK-${490 + order}`,
    title: input.title,
    project: input.project,
    priority: input.priority,
    status: "backlog",
    labels: ["Новая"],
    assignee: { name: normalizedName, initials },
    dueAt: input.dueAt,
    comments: 0,
  };
}

export function App() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const visibleTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");

    return tickets.filter((ticket) => {
      const matchesStatus = status === "all" || ticket.status === status;
      const searchable = `${ticket.id} ${ticket.title} ${ticket.project} ${ticket.assignee.name}`.toLocaleLowerCase("ru-RU");
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, status, tickets]);

  const completedCount = tickets.filter((ticket) => ticket.status === "done").length;
  const activeCount = tickets.filter((ticket) => ticket.status === "in_progress").length;

  const handleCreateTicket = async (input: CreateTicketInput) => {
    const createdRemotely = await createTicket(input);
    setTickets((current) => [createdRemotely ?? buildLocalTicket(input, current.length), ...current]);
  };

  const handleStatusChange = async (ticketId: string, nextStatus: TicketStatus) => {
    const updatedRemotely = await changeTicketStatus(ticketId, nextStatus);
    setTickets((current) => current.map((ticket) => (
      ticket.id === ticketId ? (updatedRemotely ?? { ...ticket, status: nextStatus }) : ticket
    )));
  };

  return (
    <div className="app-shell" id="workspace">
      <SideNavigation isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} taskCount={tickets.length} />
      <main className="main-content">
        <DashboardHeader onCreateTicket={() => setIsCreateModalOpen(true)} onOpenNavigation={() => setIsNavigationOpen(true)} />
        <div className="content-wrap">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Понедельник, 6 июля</p>
              <h1>Доброе утро, Рамазан <span>✦</span></h1>
              <p className="hero-panel__description">Сфокусируйтесь на важном: команда уже продвигает ключевые задачи этой недели.</p>
            </div>
            <a href="#summary" className="text-link">Открыть сводку <ArrowUpRight size={17} aria-hidden="true" /></a>
          </section>

          <section className="metrics-grid" id="summary" aria-label="Ключевые показатели">
            <article className="metric-card"><div className="metric-icon metric-icon--yellow"><ListTodo size={20} aria-hidden="true" /></div><div><span>Все задачи</span><strong>{tickets.length}</strong><small>+3 за эту неделю</small></div></article>
            <article className="metric-card"><div className="metric-icon metric-icon--blue"><Clock3 size={20} aria-hidden="true" /></div><div><span>В работе</span><strong>{activeCount}</strong><small>2 требуют внимания</small></div></article>
            <article className="metric-card"><div className="metric-icon metric-icon--green"><CircleCheckBig size={20} aria-hidden="true" /></div><div><span>Завершено</span><strong>{completedCount}</strong><small>+18% к прошлой неделе</small></div></article>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div><p className="eyebrow">Фокус сегодня</p><h2>Мои задачи <span>{visibleTickets.length}</span></h2></div>
              <p>Кликайте на статус слева, чтобы передвигать задачу по потоку.</p>
            </div>
            <TicketFilters query={query} status={status} onQueryChange={setQuery} onStatusChange={setStatus} />
            <TicketBoard tickets={visibleTickets} onStatusChange={handleStatusChange} />
          </section>
        </div>
      </main>
      <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateTicket} />
    </div>
  );
}
