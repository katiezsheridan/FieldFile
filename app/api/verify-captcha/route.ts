import { NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const isValid = await verifyRecaptcha(token);
    return NextResponse.json({ success: isValid });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
