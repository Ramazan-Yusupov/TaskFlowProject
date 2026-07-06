import type { IdGenerator } from "../../application/shared/IdGenerator.js";

export class SequentialTicketIdGenerator implements IdGenerator {
  constructor(private current = 490) {}

  next(): string {
    this.current += 1;
    return `TSK-${this.current}`;
  }
}
