import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { getOrderModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const Order = await getOrderModel();
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
    return Response.json({ orders });
  } catch (error) {
    return jsonError(error, 500);
  }
}
