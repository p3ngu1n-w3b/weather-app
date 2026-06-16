import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteInvoice, getInvoice, updateInvoice } from "@/lib/repo";
import type { Invoice } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const invoice = getInvoice(id);
  return invoice ? ok(invoice) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<Invoice>>(request);
  const updated = updateInvoice(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteInvoice(id) ? ok({ success: true }) : notFound();
}
