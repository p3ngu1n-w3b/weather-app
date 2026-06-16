import { ok, readBody, badRequest } from "@/lib/api";
import { createTeamMember, listTeam } from "@/lib/repo";
import type { TeamMember } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listTeam());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<TeamMember>>(request);
  if (!body.name?.trim()) return badRequest("Name is required.");
  return ok(createTeamMember(body), 201);
}
