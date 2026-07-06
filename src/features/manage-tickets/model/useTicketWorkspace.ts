import { useEffect, useState } from "react";
import {
  buildLocalTicket,
  getNextLocalTicketId,
  initialTickets,
  readStoredTickets,
  storeTickets,
  updateTicketFromInput,
  type CreateTicketInput,
  type Ticket,
  type TicketStatus,
} from "@/entities/ticket";
import {
  changeTicketStatus as changeTicketStatusRequest,
  createTicket as createTicketRequest,
  deleteTicket as deleteTicketRequest,
  getTickets,
  isRemoteApiEnabled,
  updateTicket as updateTicketRequest,
} from "@/shared/api/tickets";

export function useTicketWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>(() => readStoredTickets() ?? initialTickets);

  useEffect(() => {
    storeTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    if (!isRemoteApiEnabled()) return;

    let isCurrent = true;
    void getTickets()
      .then((remoteTickets) => {
        if (isCurrent && remoteTickets) setTickets(remoteTickets);
      })
      .catch(() => {
        // The locally cached list remains available when the API is temporarily unreachable.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
    const remoteTicket = await createTicketRequest(input);
    const ticket = remoteTicket ?? buildLocalTicket(input, getNextLocalTicketId(tickets));
    setTickets((current) => [ticket, ...current]);
    return ticket;
  };

  const updateTicket = async (ticketId: string, input: CreateTicketInput): Promise<Ticket> => {
    const remoteTicket = await updateTicketRequest(ticketId, input);
    let updatedTicket: Ticket | null = remoteTicket;

    setTickets((current) => current.map((ticket) => {
      if (ticket.id !== ticketId) return ticket;
      updatedTicket ??= updateTicketFromInput(ticket, input);
      return updatedTicket;
    }));

    if (!updatedTicket) {
      throw new Error("Задача не найдена.");
    }

    return updatedTicket;
  };

  const changeTicketStatus = async (ticketId: string, status: TicketStatus): Promise<Ticket> => {
    const remoteTicket = await changeTicketStatusRequest(ticketId, status);
    let updatedTicket: Ticket | null = remoteTicket;

    setTickets((current) => current.map((ticket) => {
      if (ticket.id !== ticketId) return ticket;
      updatedTicket ??= { ...ticket, status };
      return updatedTicket;
    }));

    if (!updatedTicket) {
      throw new Error("Задача не найдена.");
    }

    return updatedTicket;
  };

  const deleteTicket = async (ticketId: string): Promise<void> => {
    await deleteTicketRequest(ticketId);
    setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));
  };

  return { tickets, createTicket, updateTicket, changeTicketStatus, deleteTicket };
}
