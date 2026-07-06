import type { TicketPriority } from "@/entities/ticket";
import { validateTicketInput } from "@/entities/ticket";
export type { TicketFormErrors } from "@/entities/ticket";

export const validateTicketForm = validateTicketInput;

export function isTicketPriority(value: string): value is TicketPriority {
  return ["low", "medium", "high", "urgent"].includes(value);
}
