import { ok, readBody, badRequest } from "@/lib/api";
import { createTask, listTasks } from "@/lib/repo";
import type { Task } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listTasks());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<Task>>(request);
  if (!body.title?.trim()) return badRequest("Task title is required.");
  return ok(createTask(body), 201);
}
