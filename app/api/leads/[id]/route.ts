import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteLead, getLead, updateLead } from "@/lib/repo";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const lead = getLead(id);
  return lead ? ok(lead) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<Lead>>(request);
  const updated = updateLead(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteLead(id) ? ok({ success: true }) : notFound();
}
