import { ok, readBody, badRequest } from "@/lib/api";
import { createInvoice, listInvoices } from "@/lib/repo";
import type { Invoice } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listInvoices());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<Invoice>>(request);
  if (!body.client_id) return badRequest("A client is required.");
  return ok(createInvoice(body), 201);
}
