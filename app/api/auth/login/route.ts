import { NextResponse } from "next/server";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === "Admin" && password === "admin@123") {
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const session = await encrypt({ user: "Admin", expires });
      
      const cookieStore = await cookies();
      cookieStore.set("session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return NextResponse.json({ success: true, message: "Logged in successfully" });
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
