import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteClient, getClient, updateClient } from "@/lib/repo";
import type { Client } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const client = getClient(id);
  return client ? ok(client) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<Client>>(request);
  const updated = updateClient(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteClient(id) ? ok({ success: true }) : notFound();
}
