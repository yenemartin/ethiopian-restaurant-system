import { getMongoose } from "../db";
import type { MoneyBreakdown, OrderStatus, OrderType, PaymentMode, PaymentStatus } from "../types";

export type OrderLine = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
};

export type OrderDocument = {
  _id: string;
  orderNumber: string;
  orderType: OrderType;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupTime?: string;
  tableNumber?: number;
  items: OrderLine[];
  amounts: MoneyBreakdown;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrderModel() {
  const mongoose = await getMongoose();
  const Schema = mongoose.Schema;
  const OrderLineSchema = new Schema(
    {
      menuItemId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
      notes: { type: String },
    },
    { _id: false }
  );

  const MoneySchema = new Schema(
    {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      serviceFee: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    { _id: false }
  );

  const OrderSchema = new Schema(
    {
      orderNumber: { type: String, required: true, unique: true, index: true },
      orderType: { type: String, enum: ["pickup", "dine-in"], required: true, index: true },
      paymentMode: { type: String, enum: ["prepaid", "pay-later"], required: true },
      paymentStatus: { type: String, enum: ["pending", "paid", "unpaid", "failed"], required: true, index: true },
      status: { type: String, enum: ["open", "preparing", "ready", "served", "completed", "cancelled"], default: "open", index: true },
      customerName: { type: String, required: true },
      customerEmail: { type: String },
      customerPhone: { type: String },
      pickupTime: { type: String },
      tableNumber: { type: Number },
      items: { type: [OrderLineSchema], required: true },
      amounts: { type: MoneySchema, required: true },
      stripeCheckoutSessionId: { type: String, index: true },
      stripePaymentIntentId: { type: String },
    },
    { timestamps: true }
  );

  return mongoose.models.Order || mongoose.model("Order", OrderSchema);
}
