import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { getMenuItemModel } from "@/lib/models";
import { menuItemSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const MenuItem = await getMenuItemModel();
    const menu = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
    return Response.json({ menu });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const MenuItem = await getMenuItemModel();
    const payload = menuItemSchema.parse(await request.json());
    const item = await MenuItem.create(payload);
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return jsonError(error, 400);
  }
}
