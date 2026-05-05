import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { getSettingModel } from "@/lib/models";
import { defaultSettings, getSettings } from "@/lib/restaurant";
import { settingsSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const settings = await getSettings();
    return Response.json({ settings });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function PUT(request: Request) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const Setting = await getSettingModel();
    const payload = settingsSchema.partial().parse(await request.json());
    const settings = await Setting.findOneAndUpdate(
      { key: "restaurant" },
      { $set: { ...defaultSettings, ...payload }, $setOnInsert: { key: "restaurant" } },
      { upsert: true, new: true, runValidators: true }
    );
    return Response.json({ settings });
  } catch (error) {
    return jsonError(error, 400);
  }
}
