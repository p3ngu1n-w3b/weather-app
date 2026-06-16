import { ok, readBody, badRequest } from "@/lib/api";
import { createLead, listLeads } from "@/lib/repo";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listLeads());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<Lead>>(request);
  if (!body.name?.trim()) return badRequest("Lead name is required.");
  return ok(createLead(body), 201);
}
