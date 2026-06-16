import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteTeamMember, getTeamMember, updateTeamMember } from "@/lib/repo";
import type { TeamMember } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const member = getTeamMember(id);
  return member ? ok(member) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<TeamMember>>(request);
  const updated = updateTeamMember(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteTeamMember(id) ? ok({ success: true }) : notFound();
}
