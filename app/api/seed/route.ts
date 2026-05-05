import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { ensureSeedData } from "@/lib/restaurant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const result = await ensureSeedData();
    return Response.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error, 400);
  }
}
