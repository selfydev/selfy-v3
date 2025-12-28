import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload types
export type UploadFolder = 'templates' | 'assets' | 'thumbnails';

interface UploadOptions {
  folder: UploadFolder;
  userId: string;
  resourceType?: 'image' | 'raw' | 'auto';
  transformation?: object;
}

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - Base64 encoded file or file URL
 * @param options - Upload options
 */
export async function uploadToCloudinary(
  file: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { folder, userId, resourceType = 'image', transformation } = options;

  const uploadPath = `selfy/${folder}/${userId}`;

  const result = await cloudinary.uploader.upload(file, {
    folder: uploadPath,
    resource_type: resourceType,
    transformation: transformation,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Generate a thumbnail URL with transformations
 * @param url - Original image URL
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 */
export function getThumbnailUrl(url: string, width: number = 300, height: number = 200): string {
  // If it's a Cloudinary URL, add transformation
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height}/`);
  }
  return url;
}

/**
 * Generate a signed upload URL for client-side uploads
 * @param folder - The folder to upload to
 * @param userId - The user ID
 */
export function getUploadSignature(folder: UploadFolder, userId: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const uploadPath = `selfy/${folder}/${userId}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: uploadPath,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder: uploadPath,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

