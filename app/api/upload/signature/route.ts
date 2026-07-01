import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Include any parameters you'll use on the client here.
    // e.g., if you upload to a specific folder, you must sign it.
    const paramsToSign = {
      timestamp,
      folder: "photolab_admin",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: "photolab_admin",
    });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature", details: error.message },
      { status: 500 }
    );
  }
}
