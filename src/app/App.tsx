import { useMemo, useState } from "react";
import { ArrowUpRight, CircleCheckBig, Clock3, ListTodo } from "lucide-react";
import type { Ticket, TicketStatus } from "@/entities/ticket";
import { CreateTicketModal } from "@/features/create-ticket";
import { TicketDetailsModal } from "@/features/ticket-details";
import { useTicketWorkspace } from "@/features/manage-tickets";
import { useTheme } from "@/features/toggle-theme";
import { TicketFilters } from "@/features/ticket-filters";
import { DashboardHeader } from "@/widgets/dashboard-header";
import { SideNavigation } from "@/widgets/side-navigation";
import { TicketBoard } from "@/widgets/ticket-board";

export function App() {
  const { tickets, createTicket, updateTicket, changeTicketStatus, deleteTicket } = useTicketWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="app-shell" id="workspace">
      <SideNavigation isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} taskCount={tickets.length} />
      <main className="main-content">
        <DashboardHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onCreateTicket={() => setIsCreateModalOpen(true)}
          onOpenNavigation={() => setIsNavigationOpen(true)}
        />
        <div className="content-wrap">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">Понедельник, 6 июля</p>
              <h1>Доброе утро, Рамазан</h1>
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
            <TicketBoard tickets={visibleTickets} onStatusChange={async (ticketId, nextStatus) => { await changeTicketStatus(ticketId, nextStatus); }} onOpenTicket={setSelectedTicket} />
          </section>
        </div>
      </main>
      <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={async (input) => { await createTicket(input); }} />
      <TicketDetailsModal key={selectedTicket?.id ?? "closed"} ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={async (ticketId, input) => { await updateTicket(ticketId, input); }} onDelete={deleteTicket} />
    </div>
  );
}
