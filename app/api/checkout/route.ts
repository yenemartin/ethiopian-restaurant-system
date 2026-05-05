import { jsonError } from "@/lib/api";
import { getBaseUrl } from "@/lib/env";
import { toCents } from "@/lib/money";
import { getOrderModel } from "@/lib/models";
import { createOrder } from "@/lib/restaurant";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const parsed = checkoutSchema.parse(await request.json());
    const order = await createOrder(parsed);
    const baseUrl = getBaseUrl();

    if (order.paymentMode === "pay-later") {
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer_email: order.customerEmail,
        payment_method_types: ["card"],
        success_url: `${baseUrl}/?checkout=success&order=${order._id}`,
        cancel_url: `${baseUrl}/?checkout=cancelled&order=${order._id}`,
        metadata: {
          orderId: String(order._id),
          orderType: order.orderType,
          paymentMode: "pay-later",
        },
      });
      await (await getOrderModel()).findByIdAndUpdate(order._id, { stripeCheckoutSessionId: session.id });
      return Response.json({ checkoutUrl: session.url, orderId: order._id, paymentMode: "pay-later" });
    }

    const stripe = await getStripe();
    const lineItems = [
      ...order.items.map((item: { name: string; price: number; quantity: number }) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: toCents(item.price),
        },
      })),
      ...(order.amounts.tax > 0
        ? [{ quantity: 1, price_data: { currency: "usd", product_data: { name: "Sales tax" }, unit_amount: toCents(order.amounts.tax) } }]
        : []),
      ...(order.amounts.serviceFee > 0
        ? [{ quantity: 1, price_data: { currency: "usd", product_data: { name: "Service fee" }, unit_amount: toCents(order.amounts.serviceFee) } }]
        : []),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: lineItems,
      success_url: `${baseUrl}/?checkout=success&order=${order._id}`,
      cancel_url: `${baseUrl}/?checkout=cancelled&order=${order._id}`,
      metadata: {
        orderId: String(order._id),
        orderType: order.orderType,
        paymentMode: "prepaid",
      },
      payment_intent_data: {
        metadata: { orderId: String(order._id) },
      },
    });

    await (await getOrderModel()).findByIdAndUpdate(order._id, { stripeCheckoutSessionId: session.id });
    return Response.json({ checkoutUrl: session.url, orderId: order._id, paymentMode: "prepaid" });
  } catch (error) {
    return jsonError(error, 400);
  }
}
