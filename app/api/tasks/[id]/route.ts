import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deleteTask, getTask, updateTask } from "@/lib/repo";
import type { Task } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const task = getTask(id);
  return task ? ok(task) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<Task>>(request);
  const updated = updateTask(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deleteTask(id) ? ok({ success: true }) : notFound();
}
