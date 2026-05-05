import { connectToDatabase } from "./db";
import { calculateTotals } from "./money";
import { getMenuItemModel, getOrderModel, getSettingModel } from "./models";
import type { CartLineInput, CheckoutInput, PaymentMode } from "./types";

type CreatedOrder = {
  _id: string;
  orderType: "pickup" | "dine-in";
  paymentMode: "prepaid" | "pay-later";
  paymentStatus: string;
  customerEmail?: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  amounts: { tax: number; serviceFee: number; total: number; subtotal: number };
};

export const seedMenu = [
  { name: "Doro Wat", description: "Spicy chicken stew with egg and injera.", category: "Meat", price: 18.99, available: true, spice: "Hot", image: "ethiopian-doro-wat" },
  { name: "Misir Wat", description: "Berbere lentils, slow-simmered and rich.", category: "Vegan", price: 14.5, available: true, spice: "Medium", image: "ethiopian-misir-wat" },
  { name: "Veggie Combo", description: "Assorted seasonal vegetables and lentils on injera.", category: "Combo", price: 16.99, available: true, spice: "Mild", image: "ethiopian-veggie-combo" },
  { name: "Kitfo", description: "Minced beef, mitmita butter, ayib on the side.", category: "Meat", price: 22, available: true, spice: "Hot", image: "ethiopian-kitfo" },
  { name: "Extra Injera", description: "Fresh rolled injera.", category: "Sides", price: 2.5, available: true, spice: "", image: "ethiopian-injera" },
  { name: "Ethiopian Coffee", description: "Traditional dark roast coffee.", category: "Drinks", price: 4.5, available: true, spice: "", image: "ethiopian-coffee" },
] as const;

export const defaultSettings = {
  restaurantName: "Addis Ababa Restaurant",
  pickupEnabled: true,
  dineInEnabled: true,
  pickupOpen: "11:00 AM",
  pickupClose: "9:30 PM",
  dineInOpen: "11:00 AM",
  dineInClose: "10:00 PM",
  taxRate: 0.101,
  serviceFee: 0,
  currency: "usd",
};

export async function getSettings(): Promise<typeof defaultSettings> {
  await connectToDatabase();
  const Setting = await getSettingModel();
  return (await Setting.findOneAndUpdate({ key: "restaurant" }, { $setOnInsert: { key: "restaurant", ...defaultSettings } }, { upsert: true, new: true, lean: true })) as typeof defaultSettings;
}

export async function getPublicMenu() {
  await connectToDatabase();
  const MenuItem = await getMenuItemModel();
  return MenuItem.find({ available: true }).sort({ category: 1, name: 1 }).lean();
}

export async function ensureSeedData() {
  await connectToDatabase();
  const settings = await getSettings();
  const MenuItem = await getMenuItemModel();
  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany(seedMenu);
  }
  const menu = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
  return { settings, menu, insertedMenuItems: menuCount === 0 ? seedMenu.length : 0 };
}

export async function buildOrderLines(lines: CartLineInput[]) {
  await connectToDatabase();
  const ids = lines.map((line) => line.menuItemId);
  const MenuItem = await getMenuItemModel();
  const menuItems = (await MenuItem.find({ _id: { $in: ids }, available: true }).lean()) as Array<{ _id: string; name: string; price: number }>;
  const menuById = new Map(menuItems.map((item) => [String(item._id), item]));

  return lines.map((line) => {
    const item = menuById.get(line.menuItemId);
    if (!item) throw new Error(`Menu item ${line.menuItemId} is unavailable.`);
    return {
      menuItemId: line.menuItemId,
      name: item.name,
      price: item.price,
      quantity: line.quantity,
      notes: line.notes,
    };
  });
}

export async function createOrder(input: CheckoutInput) {
  const settings = await getSettings();
  const items = await buildOrderLines(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const amounts = calculateTotals(subtotal, settings.taxRate, settings.serviceFee);
  const paymentMode: PaymentMode = input.paymentMode || (input.orderType === "pickup" ? "prepaid" : "pay-later");

  const Order = await getOrderModel();
  const order = (await Order.create({
    orderNumber: `${input.orderType === "pickup" ? "P" : "T"}-${Date.now().toString().slice(-6)}`,
    orderType: input.orderType,
    paymentMode,
    paymentStatus: paymentMode === "prepaid" ? "pending" : "unpaid",
    status: "open",
    customerName: input.customerName,
    customerEmail: input.customerEmail || undefined,
    customerPhone: input.customerPhone,
    pickupTime: input.pickupTime,
    tableNumber: input.tableNumber,
    items,
    amounts,
  })) as CreatedOrder;

  return order;
}
