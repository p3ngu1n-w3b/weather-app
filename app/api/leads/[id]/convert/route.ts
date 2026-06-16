import { ok, notFound, parseId, badRequest } from "@/lib/api";
import { convertLeadToClient } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const client = convertLeadToClient(id);
  return client ? ok(client, 201) : notFound("Lead not found.");
}
