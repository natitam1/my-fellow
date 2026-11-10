import { NextRequest, NextResponse } from "next/server";
import { donations } from "@/lib/data";
import { requireAdmin } from "@/lib/server/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: auth.status },
    );
  }

  if (!["admin", "super_admin"].includes(String(auth.payload.role))) {
    return NextResponse.json(
      { success: false, message: "Forbidden: Super Admin or Admin access required to view financial records." },
      { status: 403 },
    );
  }

  // Mock data source uses `donations` for transactions.
  return NextResponse.json({ success: true, data: donations });
}
