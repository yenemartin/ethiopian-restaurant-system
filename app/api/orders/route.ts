import { jsonError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getOrderModel } from "@/lib/models";
import { createOrder } from "@/lib/restaurant";
import { checkoutSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const Order = await getOrderModel();
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();
    return Response.json({ orders });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json());
    const order = await createOrder(input);
    return Response.json({ order }, { status: 201 });
  } catch (error) {
    return jsonError(error, 400);
  }
}
