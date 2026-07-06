import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import type { CreateTicketInput } from "@/entities/ticket";
import { TICKET_PRIORITIES } from "@/entities/ticket";
import { Button, IconButton } from "@/shared/ui";
import { isTicketPriority, validateTicketForm, type TicketFormErrors } from "../model/createTicketSchema";

type CreateTicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTicketInput) => Promise<void>;
};

const initialForm: CreateTicketInput = {
  title: "",
  project: "Product design",
  priority: "medium",
  assigneeName: "",
  dueAt: "2026-07-10",
};

export function CreateTicketModal({ isOpen, onClose, onCreate }: CreateTicketModalProps) {
  const [form, setForm] = useState<CreateTicketInput>(initialForm);
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = <K extends keyof CreateTicketInput>(key: K, value: CreateTicketInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateTicketForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate({ ...form, title: form.title.trim(), assigneeName: form.assigneeName.trim() });
      setForm(initialForm);
      onClose();
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
            <p className="eyebrow">Новая задача</p>
            <h2 id={titleId}>Добавить задачу в поток</h2>
          </div>
          <IconButton label="Закрыть окно" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </IconButton>
        </header>

        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
          <label className="field field--wide">
            <span>Название задачи</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Например, подготовить релизный чек-лист"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
              autoFocus
            />
            {errors.title && <small id="title-error" className="field__error">{errors.title}</small>}
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
            <select
              value={form.priority}
              onChange={(event) => {
                if (isTicketPriority(event.target.value)) updateField("priority", event.target.value);
              }}
            >
              {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Исполнитель</span>
            <input
              value={form.assigneeName}
              onChange={(event) => updateField("assigneeName", event.target.value)}
              placeholder="Имя сотрудника"
              aria-invalid={Boolean(errors.assigneeName)}
            />
            {errors.assigneeName && <small className="field__error">{errors.assigneeName}</small>}
          </label>

          <label className="field">
            <span>Срок</span>
            <div className="field__with-icon">
              <CalendarDays size={18} aria-hidden="true" />
              <input
                type="date"
                value={form.dueAt}
                onChange={(event) => updateField("dueAt", event.target.value)}
                aria-invalid={Boolean(errors.dueAt)}
              />
            </div>
            {errors.dueAt && <small className="field__error">{errors.dueAt}</small>}
          </label>

          <footer className="modal__footer">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём…" : "Создать задачу"}</Button>
          </footer>
        </form>
      </section>
    </div>
  );
}
