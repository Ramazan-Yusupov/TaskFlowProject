import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, Trash2, X } from "lucide-react";
import {
  TICKET_PRIORITIES,
  type CreateTicketInput,
  type Ticket,
  type TicketFormErrors,
  validateTicketInput,
} from "@/entities/ticket";
import { Button, IconButton } from "@/shared/ui";
import { isTicketPriority } from "../model/ticketDetailsSchema";

const emptyForm: CreateTicketInput = {
  title: "",
  project: "Product design",
  priority: "medium",
  assigneeName: "",
  dueAt: "2026-07-10",
};

function toForm(ticket: Ticket): CreateTicketInput {
  return {
    title: ticket.title,
    project: ticket.project,
    priority: ticket.priority,
    assigneeName: ticket.assignee.name,
    dueAt: ticket.dueAt,
  };
}

type TicketDetailsModalProps = {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdate: (ticketId: string, input: CreateTicketInput) => Promise<void>;
  onDelete: (ticketId: string) => Promise<void>;
};

export function TicketDetailsModal({ ticket, onClose, onUpdate, onDelete }: TicketDetailsModalProps) {
  const [form, setForm] = useState<CreateTicketInput>(() => ticket ? toForm(ticket) : emptyForm);
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isOpen = ticket !== null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!ticket) return null;

  const updateField = <K extends keyof CreateTicketInput>(key: K, value: CreateTicketInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateTicketInput(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(ticket.id, { ...form, title: form.title.trim(), assigneeName: form.assigneeName.trim() });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось сохранить изменения.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить задачу ${ticket.id}? Это действие нельзя отменить.`)) return;

    setIsSubmitting(true);
    try {
      await onDelete(ticket.id);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось удалить задачу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="eyebrow">{ticket.id}</p>
            <h2 id={titleId}>Детали задачи</h2>
          </div>
          <IconButton label="Закрыть окно" onClick={onClose} disabled={isSubmitting}>
            <X size={20} aria-hidden="true" />
          </IconButton>
        </header>

        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
          <label className="field field--wide">
            <span>Название задачи</span>
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} aria-invalid={Boolean(errors.title)} />
            {errors.title && <small className="field__error">{errors.title}</small>}
          </label>

          <label className="field">
            <span>Проект</span>
            <select value={form.project} onChange={(event) => updateField("project", event.target.value)}>
              <option>Product design</option>
              <option>Core platform</option>
              <option>Operations</option>
              <option>Customer success</option>
            </select>
            {errors.project && <small className="field__error">{errors.project}</small>}
          </label>

          <label className="field">
            <span>Приоритет</span>
            <select value={form.priority} onChange={(event) => isTicketPriority(event.target.value) && updateField("priority", event.target.value)}>
              {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Исполнитель</span>
            <input value={form.assigneeName} onChange={(event) => updateField("assigneeName", event.target.value)} aria-invalid={Boolean(errors.assigneeName)} />
            {errors.assigneeName && <small className="field__error">{errors.assigneeName}</small>}
          </label>

          <label className="field">
            <span>Срок</span>
            <div className="field__with-icon">
              <CalendarDays size={18} aria-hidden="true" />
              <input type="date" value={form.dueAt} onChange={(event) => updateField("dueAt", event.target.value)} aria-invalid={Boolean(errors.dueAt)} />
            </div>
            {errors.dueAt && <small className="field__error">{errors.dueAt}</small>}
          </label>

          {submitError && <small className="field__error field--wide">{submitError}</small>}

          <footer className="modal__footer">
            <Button variant="danger" onClick={handleDelete} disabled={isSubmitting}><Trash2 size={16} aria-hidden="true" /> Удалить</Button>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Сохраняем…" : "Сохранить"}</Button>
          </footer>
        </form>
      </section>
    </div>
  );
}
