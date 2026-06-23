import { NextResponse } from "next/server";
import { listImages } from "@/services/cloudinaryService";

export async function GET() {
  try {
    const formattedFiles = await listImages();
    return NextResponse.json({ success: true, images: formattedFiles });
  } catch (error: any) {
    console.error("Fetch images error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images", details: error.message },
      { status: 500 }
    );
  }
}
