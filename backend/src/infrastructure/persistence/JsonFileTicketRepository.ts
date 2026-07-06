import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Ticket, TicketStatus } from "../../domain/ticket/Ticket.js";
import type { TicketRepository } from "../../domain/ticket/TicketRepository.js";

export class JsonFileTicketRepository implements TicketRepository {
  private readonly tickets = new Map<string, Ticket>();
  private hasLoaded = false;

  constructor(
    private readonly filePath: string,
    private readonly seed: Ticket[],
  ) {}

  async list(filters?: { status?: TicketStatus; query?: string }): Promise<Ticket[]> {
    await this.load();
    const query = filters?.query?.trim().toLocaleLowerCase("ru-RU");

    return [...this.tickets.values()].filter((ticket) => {
      const matchesStatus = !filters?.status || ticket.status === filters.status;
      const searchable = `${ticket.id} ${ticket.title} ${ticket.project} ${ticket.assignee.name}`.toLocaleLowerCase("ru-RU");
      return matchesStatus && (!query || searchable.includes(query));
    });
  }

  async findById(id: string): Promise<Ticket | null> {
    await this.load();
    return this.tickets.get(id) ?? null;
  }

  async save(ticket: Ticket): Promise<void> {
    await this.load();
    this.tickets.set(ticket.id, ticket);
    await this.persist();
  }

  async delete(id: string): Promise<void> {
    await this.load();
    this.tickets.delete(id);
    await this.persist();
  }

  private async load(): Promise<void> {
    if (this.hasLoaded) return;

    try {
      const source = await readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(source);
      if (Array.isArray(parsed)) {
        for (const ticket of parsed) {
          if (isTicket(ticket)) this.tickets.set(ticket.id, ticket);
        }
      }
    } catch {
      for (const ticket of this.seed) this.tickets.set(ticket.id, ticket);
      await this.persist();
    }

    if (!this.tickets.size) {
      for (const ticket of this.seed) this.tickets.set(ticket.id, ticket);
      await this.persist();
    }

    this.hasLoaded = true;
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify([...this.tickets.values()], null, 2), "utf8");
  }
}

function isTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const assignee = candidate.assignee;
  return typeof candidate.id === "string"
    && typeof candidate.title === "string"
    && typeof candidate.project === "string"
    && (candidate.status === "backlog" || candidate.status === "in_progress" || candidate.status === "review" || candidate.status === "done")
    && (candidate.priority === "low" || candidate.priority === "medium" || candidate.priority === "high" || candidate.priority === "urgent")
    && Array.isArray(candidate.labels)
    && candidate.labels.every((label) => typeof label === "string")
    && typeof candidate.dueAt === "string"
    && typeof candidate.comments === "number"
    && typeof assignee === "object"
    && assignee !== null
    && typeof (assignee as Record<string, unknown>).name === "string"
    && typeof (assignee as Record<string, unknown>).initials === "string";
}
