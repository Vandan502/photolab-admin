import { NextResponse } from "next/server";
import { deleteImage } from "@/services/cloudinaryService";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    await deleteImage(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: "Failed to delete image", details: error.message },
      { status: 500 }
    );
  }
}
