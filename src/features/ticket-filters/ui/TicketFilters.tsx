import { Search, SlidersHorizontal } from "lucide-react";
import type { TicketStatus } from "@/entities/ticket";
import { TICKET_STATUSES, statusMeta } from "@/entities/ticket";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui";

type TicketFiltersProps = {
  query: string;
  status: TicketStatus | "all";
  onQueryChange: (value: string) => void;
  onStatusChange: (value: TicketStatus | "all") => void;
};

export function TicketFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <div className="ticket-filters">
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск задач"
          aria-label="Поиск задач"
        />
        <kbd>⌘ K</kbd>
      </div>
      <div className="filter-tabs" aria-label="Фильтр по статусу">
        <button
          className={cn("filter-tab", status === "all" && "filter-tab--active")}
          type="button"
          onClick={() => onStatusChange("all")}
        >
          Все
        </button>
        {TICKET_STATUSES.map((item) => (
          <button
            key={item}
            className={cn(
              "filter-tab",
              status === item && "filter-tab--active",
            )}
            type="button"
            onClick={() => onStatusChange(item)}
          >
            {statusMeta[item].label}
          </button>
        ))}
      </div>
      <IconButton label="Дополнительные фильтры" className="filters-button">
        <SlidersHorizontal size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
