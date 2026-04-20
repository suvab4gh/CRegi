import { getRuntimeReadiness } from "@/lib/runtime-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const readiness = await getRuntimeReadiness();
  return Response.json({ readiness });
}
