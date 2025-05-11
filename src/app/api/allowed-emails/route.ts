import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addAllowedEmail,
  getAllowedEmails,
  removeAllowedEmail,
} from "@/lib/actions/auth/allowed-email";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);

    await addAllowedEmail(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding allowed email:", error);
    return NextResponse.json({ error: "Failed to add email" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const allowedEmails = await getAllowedEmails();
    return NextResponse.json({ allowedEmails });
  } catch (error) {
    console.error("Error fetching allowed emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch allowed emails" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { email } = emailSchema.parse(body);

    await removeAllowedEmail(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing allowed email:", error);
    return NextResponse.json(
      { error: "Failed to remove email" },
      { status: 400 },
    );
  }
}
