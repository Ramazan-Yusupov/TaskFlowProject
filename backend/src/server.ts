import { createServer } from "node:http";
import { ChangeTicketStatus } from "./application/ticket/ChangeTicketStatus.js";
import { CreateTicket } from "./application/ticket/CreateTicket.js";
import { ListTickets } from "./application/ticket/ListTickets.js";
import { SequentialTicketIdGenerator } from "./infrastructure/ids/SequentialTicketIdGenerator.js";
import { InMemoryTicketRepository } from "./infrastructure/persistence/InMemoryTicketRepository.js";
import { routeTickets } from "./presentation/http/TicketRouter.js";
import { getPath, sendJson } from "./presentation/http/http.js";

const repository = new InMemoryTicketRepository();
const ticketIdGenerator = new SequentialTicketIdGenerator();
const dependencies = {
  createTicket: new CreateTicket(repository, ticketIdGenerator),
  listTickets: new ListTickets(repository),
  changeTicketStatus: new ChangeTicketStatus(repository),
};

const port = Number(process.env.PORT ?? 4000);
const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") { response.writeHead(204); response.end(); return; }
  if (request.method === "GET" && getPath(request) === "/health") { sendJson(response, 200, { status: "ok" }); return; }
  if (await routeTickets(request, response, dependencies)) return;
  sendJson(response, 404, { ok: false, code: "NOT_FOUND", message: "Маршрут не найден." });
});

server.listen(port, () => {
  console.log(`TaskFlow API is listening on http://localhost:${port}`);
});
