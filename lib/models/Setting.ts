import { getMongoose } from "../db";

export type SettingDocument = {
  _id: string;
  key: "restaurant";
  restaurantName: string;
  pickupEnabled: boolean;
  dineInEnabled: boolean;
  pickupOpen: string;
  pickupClose: string;
  dineInOpen: string;
  dineInClose: string;
  taxRate: number;
  serviceFee: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSettingModel() {
  const mongoose = await getMongoose();
  const Schema = mongoose.Schema;
  const SettingSchema = new Schema(
    {
      key: { type: String, default: "restaurant", unique: true, immutable: true },
      restaurantName: { type: String, default: "Addis Ababa Restaurant" },
      pickupEnabled: { type: Boolean, default: true },
      dineInEnabled: { type: Boolean, default: true },
      pickupOpen: { type: String, default: "11:00 AM" },
      pickupClose: { type: String, default: "9:30 PM" },
      dineInOpen: { type: String, default: "11:00 AM" },
      dineInClose: { type: String, default: "10:00 PM" },
      taxRate: { type: Number, default: 0.101, min: 0 },
      serviceFee: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "usd", lowercase: true },
    },
    { timestamps: true }
  );

  return mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
}
