import { ok, readBody, badRequest } from "@/lib/api";
import { createClient, listClients } from "@/lib/repo";
import type { Client } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listClients());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<Client>>(request);
  if (!body.name?.trim()) return badRequest("Client name is required.");
  return ok(createClient(body), 201);
}
