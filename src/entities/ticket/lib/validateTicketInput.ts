import type { CreateTicketInput } from "../model/types";

export type TicketFormErrors = Partial<Record<keyof CreateTicketInput, string>>;

export function validateTicketInput(values: CreateTicketInput): TicketFormErrors {
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
