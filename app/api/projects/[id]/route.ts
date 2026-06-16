import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteProject, getProject, updateProject } from "@/lib/repo";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const project = getProject(id);
  return project ? ok(project) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<Project>>(request);
  const updated = updateProject(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteProject(id) ? ok({ success: true }) : notFound();
}
