import assert from "node:assert/strict";
import test from "node:test";
import { ChangeTicketStatus, InvalidTicketStatusTransitionError } from "../src/application/ticket/ChangeTicketStatus.js";
import { CreateTicket } from "../src/application/ticket/CreateTicket.js";
import { DeleteTicket } from "../src/application/ticket/DeleteTicket.js";
import { UpdateTicket } from "../src/application/ticket/UpdateTicket.js";
import { SequentialTicketIdGenerator } from "../src/infrastructure/ids/SequentialTicketIdGenerator.js";
import { InMemoryTicketRepository } from "../src/infrastructure/persistence/InMemoryTicketRepository.js";

const createCommand = {
  title: "Подготовить рабочую документацию",
  project: "Core platform",
  priority: "high" as const,
  assigneeName: "Илья Носов",
  dueAt: "2026-07-15",
};

test("создаёт, обновляет и удаляет задачу", async () => {
  const repository = new InMemoryTicketRepository([]);
  const createTicket = new CreateTicket(repository, new SequentialTicketIdGenerator(500));
  const updateTicket = new UpdateTicket(repository);
  const deleteTicket = new DeleteTicket(repository);

  const created = await createTicket.execute(createCommand);
  assert.equal(created.id, "TSK-501");
  assert.equal(created.assignee.initials, "ИН");

  const updated = await updateTicket.execute(created.id, { ...createCommand, title: "Обновить рабочую документацию", priority: "urgent" });
  assert.equal(updated.title, "Обновить рабочую документацию");
  assert.equal(updated.priority, "urgent");

  await deleteTicket.execute(created.id);
  assert.equal(await repository.findById(created.id), null);
});

test("разрешает только следующий статус потока", async () => {
  const repository = new InMemoryTicketRepository([]);
  const createTicket = new CreateTicket(repository, new SequentialTicketIdGenerator(500));
  const changeStatus = new ChangeTicketStatus(repository);
  const created = await createTicket.execute(createCommand);

  const inProgress = await changeStatus.execute(created.id, "in_progress");
  assert.equal(inProgress.status, "in_progress");

  await assert.rejects(() => changeStatus.execute(created.id, "done"), InvalidTicketStatusTransitionError);
});
