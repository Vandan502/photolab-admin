import { NextResponse } from "next/server";
import { uploadImage } from "@/services/cloudinaryService";

export const maxDuration = 60; // Set max duration for Vercel deployment if needed

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await uploadImage(buffer, file.name, file.type);
      uploadedFiles.push(result);
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: error.message },
      { status: 500 }
    );
  }
}
