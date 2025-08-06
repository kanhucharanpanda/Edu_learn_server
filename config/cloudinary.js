import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary using your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A helper function to upload a file from a local path to Cloudinary
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect if it's an image or video
      folder: "elearning_assets", // A folder in Cloudinary to keep uploads organized
    });

    // Remove the locally saved temporary file after successful upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // If the upload fails, still remove the temporary local file
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};
