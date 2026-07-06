import type { CreateTicketInput, TicketPriority } from "@/entities/ticket";

type TicketFormValues = CreateTicketInput;

export type TicketFormErrors = Partial<Record<keyof TicketFormValues, string>>;

export function validateTicketForm(values: TicketFormValues): TicketFormErrors {
  const errors: TicketFormErrors = {};

  if (values.title.trim().length < 5) {
    errors.title = "Введите не менее 5 символов.";
  }

  if (!values.project.trim()) {
    errors.project = "Выберите направление работы.";
  }

  if (!values.assigneeName.trim()) {
    errors.assigneeName = "Укажите исполнителя.";
  }

  if (!values.dueAt) {
    errors.dueAt = "Выберите срок выполнения.";
  }

  return errors;
}

export function isTicketPriority(value: string): value is TicketPriority {
  return ["low", "medium", "high", "urgent"].includes(value);
}
