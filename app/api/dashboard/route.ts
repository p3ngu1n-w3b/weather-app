import { ok } from "@/lib/api";
import { getDashboard } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return ok(getDashboard());
}
