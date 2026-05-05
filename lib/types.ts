export type OrderType = "pickup" | "dine-in";
export type PaymentMode = "prepaid" | "pay-later";
export type PaymentStatus = "pending" | "paid" | "unpaid" | "failed";
export type OrderStatus = "open" | "preparing" | "ready" | "served" | "completed" | "cancelled";
export type MenuCategory = "Meat" | "Vegan" | "Combo" | "Sides" | "Drinks";

export type CartLineInput = {
  menuItemId: string;
  quantity: number;
  notes?: string;
};

export type CheckoutInput = {
  orderType: OrderType;
  paymentMode?: PaymentMode;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupTime?: string;
  tableNumber?: number;
  items: CartLineInput[];
};

export type MoneyBreakdown = {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
};
