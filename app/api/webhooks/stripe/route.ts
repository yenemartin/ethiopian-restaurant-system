import { jsonError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getOrderModel } from "@/lib/models";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const stripe = await getStripe();
    const signature = request.headers.get("stripe-signature");
    if (!signature) return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    await connectToDatabase();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await (await getOrderModel()).findByIdAndUpdate(orderId, {
          paymentStatus: session.mode === "payment" ? "paid" : "unpaid",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) await (await getOrderModel()).findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    }

    return Response.json({ received: true });
  } catch (error) {
    return jsonError(error, 400);
  }
}
