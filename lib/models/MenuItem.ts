import { getMongoose } from "../db";
import type { MenuCategory } from "../types";

export type MenuItemDocument = {
  _id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  available: boolean;
  spice: "" | "Mild" | "Medium" | "Hot";
  image: string;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getMenuItemModel() {
  const mongoose = await getMongoose();
  const Schema = mongoose.Schema;
  const MenuItemSchema = new Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, default: "" },
      category: { type: String, enum: ["Meat", "Vegan", "Combo", "Sides", "Drinks"], required: true, index: true },
      price: { type: Number, required: true, min: 0 },
      available: { type: Boolean, default: true, index: true },
      spice: { type: String, enum: ["", "Mild", "Medium", "Hot"], default: "" },
      image: { type: String, default: "ethiopian-injera" },
      stripePriceId: { type: String },
    },
    { timestamps: true }
  );

  return mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
}
