import type { IncomingMessage, ServerResponse } from "node:http";

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const body = Buffer.concat(chunks).toString("utf8");
  if (!body) return {};

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export function sendError(response: ServerResponse, status: number, code: string, message: string, fieldErrors?: Record<string, string[]>): void {
  sendJson(response, status, { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) });
}

export function getPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}
