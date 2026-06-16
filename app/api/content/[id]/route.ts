import { ok, readBody, notFound, parseId, badRequest } from "@/lib/api";
import { deletePost, getPost, updatePost } from "@/lib/repo";
import type { ContentPost } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const post = getPost(id);
  return post ? ok(post) : notFound();
}

export async function PATCH(request: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  const body = await readBody<Partial<ContentPost>>(request);
  const updated = updatePost(id, body);
  return updated ? ok(updated) : notFound();
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = await parseId(params);
  if (!id) return badRequest("Invalid id.");
  return deletePost(id) ? ok({ success: true }) : notFound();
}
