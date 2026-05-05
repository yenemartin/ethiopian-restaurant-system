import { getPublicMenu } from "@/lib/restaurant";
import { jsonError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const menu = await getPublicMenu();
    return Response.json({ menu });
  } catch (error) {
    return jsonError(error, 500);
  }
}
