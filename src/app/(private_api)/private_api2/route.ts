import { requireAuth } from "@/src/lib/auth-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await requireAuth();
    return NextResponse.json({
      message: "This is protected API route 2",
      user: session.user,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST() {
  try {
    const session = await requireAuth();
    return NextResponse.json({
      message: "POST request to API 2 successful",
      user: session.user,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
