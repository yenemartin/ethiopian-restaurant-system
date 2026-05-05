import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  category: z.enum(["Meat", "Vegan", "Combo", "Sides", "Drinks"]),
  price: z.coerce.number().nonnegative(),
  available: z.boolean().default(true),
  spice: z.enum(["", "Mild", "Medium", "Hot"]).default(""),
  image: z.string().default("ethiopian-injera"),
  stripePriceId: z.string().optional(),
});

export const settingsSchema = z.object({
  restaurantName: z.string().min(1).default("Addis Ababa Restaurant"),
  pickupEnabled: z.boolean().default(true),
  dineInEnabled: z.boolean().default(true),
  pickupOpen: z.string().default("11:00 AM"),
  pickupClose: z.string().default("9:30 PM"),
  dineInOpen: z.string().default("11:00 AM"),
  dineInClose: z.string().default("10:00 PM"),
  taxRate: z.coerce.number().min(0).default(0.101),
  serviceFee: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default("usd"),
});

export const checkoutSchema = z.object({
  orderType: z.enum(["pickup", "dine-in"]),
  paymentMode: z.enum(["prepaid", "pay-later"]).optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  pickupTime: z.string().optional(),
  tableNumber: z.coerce.number().int().positive().optional(),
  items: z.array(z.object({
    menuItemId: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    notes: z.string().optional(),
  })).min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(["open", "preparing", "ready", "served", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "unpaid", "failed"]).optional(),
});
