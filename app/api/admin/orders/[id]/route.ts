import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { getOrderModel } from "@/lib/models";
import { orderStatusSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const { id } = await params;
    const Order = await getOrderModel();
    const payload = orderStatusSchema.parse(await request.json());
    const order = await Order.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json({ order });
  } catch (error) {
    return jsonError(error, 400);
  }
}
