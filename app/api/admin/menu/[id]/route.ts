import { jsonError } from "@/lib/api";
import { requireAdminToken } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { getMenuItemModel } from "@/lib/models";
import { menuItemSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const { id } = await params;
    const MenuItem = await getMenuItemModel();
    const payload = menuItemSchema.partial().parse(await request.json());
    const item = await MenuItem.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!item) return Response.json({ error: "Menu item not found" }, { status: 404 });
    return Response.json({ item });
  } catch (error) {
    return jsonError(error, 400);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminToken(request);
    await connectToDatabase();
    const { id } = await params;
    const MenuItem = await getMenuItemModel();
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) return Response.json({ error: "Menu item not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error, 400);
  }
}
