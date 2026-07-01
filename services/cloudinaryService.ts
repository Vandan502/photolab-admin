import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER_NAME = "photolab_admin";

export async function uploadImage(buffer: Buffer, originalName: string, mimeType: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "INSERT_YOUR_CLOUD_NAME_HERE") {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing. Please add it to your .env.local file.");
  }

  return new Promise<{ id: string; url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER_NAME,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload to Cloudinary"));
        } else {
          resolve({
            id: result.public_id,
            url: result.secure_url,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function listImages() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "INSERT_YOUR_CLOUD_NAME_HERE") {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing. Please add it to your .env.local file.");
  }

  const result = await cloudinary.search
    .expression(`folder:${FOLDER_NAME}`)
    .sort_by("created_at", "desc")
    .max_results(500)
    .execute();

  return result.resources.map((file: any) => ({
    id: file.public_id.replace(`${FOLDER_NAME}/`, ""),
    name: file.filename || file.public_id.split("/").pop(),
    url: file.secure_url,
    thumbnailLink: cloudinary.url(file.public_id, {
      width: 400,
      crop: "scale",
    }),
    size: `${(file.bytes / 1024 / 1024).toFixed(2)} MB`,
    date: new Date(file.created_at).toLocaleDateString(),
  }));
}

export async function deleteImage(publicId: string) {
  if (!publicId) return false;
  
  // Re-attach folder name since we stripped it in listImages
  const fullId = publicId.includes(FOLDER_NAME) ? publicId : `${FOLDER_NAME}/${publicId}`;
  const result = await cloudinary.uploader.destroy(fullId);
  return result.result === "ok";
}
