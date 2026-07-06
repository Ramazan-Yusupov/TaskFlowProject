import { createServer } from "node:http";
import { resolve } from "node:path";
import { ChangeTicketStatus } from "./application/ticket/ChangeTicketStatus.js";
import { CreateTicket } from "./application/ticket/CreateTicket.js";
import { DeleteTicket } from "./application/ticket/DeleteTicket.js";
import { ListTickets } from "./application/ticket/ListTickets.js";
import { UpdateTicket } from "./application/ticket/UpdateTicket.js";
import { SequentialTicketIdGenerator } from "./infrastructure/ids/SequentialTicketIdGenerator.js";
import { JsonFileTicketRepository } from "./infrastructure/persistence/JsonFileTicketRepository.js";
import { seedTickets } from "./infrastructure/persistence/seedTickets.js";
import { routeTickets } from "./presentation/http/TicketRouter.js";
import { getPath, sendJson } from "./presentation/http/http.js";

function getHighestTicketNumber(ids: string[]): number {
  return ids.reduce((highest, id) => {
    const match = /^TSK-(\d+)$/.exec(id);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 490);
}

async function startServer(): Promise<void> {
  const repository = new JsonFileTicketRepository(resolve(process.cwd(), "backend/.data/tickets.json"), seedTickets);
  const currentTickets = await repository.list();
  const dependencies = {
    createTicket: new CreateTicket(repository, new SequentialTicketIdGenerator(getHighestTicketNumber(currentTickets.map((ticket) => ticket.id)))),
    listTickets: new ListTickets(repository),
    updateTicket: new UpdateTicket(repository),
    deleteTicket: new DeleteTicket(repository),
    changeTicketStatus: new ChangeTicketStatus(repository),
  };

  const port = Number(process.env.PORT ?? 4000);
  const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  const server = createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") { response.writeHead(204); response.end(); return; }
    if (request.method === "GET" && getPath(request) === "/health") { sendJson(response, 200, { status: "ok" }); return; }
    if (await routeTickets(request, response, dependencies)) return;
    sendJson(response, 404, { ok: false, code: "NOT_FOUND", message: "Маршрут не найден." });
  });

  server.listen(port, () => {
    console.log(`TaskFlow API is listening on http://localhost:${port}`);
  });
}

void startServer();
