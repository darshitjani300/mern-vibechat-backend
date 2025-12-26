import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error: any, result: any) => {
          console.log("Error ", error, "Result ", result);
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(fileBuffer);
  });
};

export default uploadToCloudinary;
