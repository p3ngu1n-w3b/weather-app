import { ok, readBody, badRequest } from "@/lib/api";
import { createProject, listProjects } from "@/lib/repo";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listProjects());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<Project>>(request);
  if (!body.name?.trim()) return badRequest("Project name is required.");
  if (!body.client_id) return badRequest("A client is required.");
  return ok(createProject(body), 201);
}
