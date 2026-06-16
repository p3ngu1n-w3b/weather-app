import { ok, readBody, badRequest } from "@/lib/api";
import { createPost, listPosts } from "@/lib/repo";
import type { ContentPost } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(listPosts());
}

export async function POST(request: Request) {
  const body = await readBody<Partial<ContentPost>>(request);
  if (!body.title?.trim()) return badRequest("Post title is required.");
  if (!body.client_id) return badRequest("A client is required.");
  return ok(createPost(body), 201);
}
