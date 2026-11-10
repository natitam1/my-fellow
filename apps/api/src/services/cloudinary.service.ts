import cloudinary from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary supporting either CLOUDINARY_URL or individual credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.v2.config({
    cloudinary_url: cloudinaryUrl,
    secure: true,
  });
} else {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export interface MediaVariants {
  original: string;
  sm: string;
  md: string;
  lg: string;
  [key: string]: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  variants?: MediaVariants;
}

export interface UploadOptions {
  folder?: string;
  transformation?: any;
  resource_type?: "image" | "video" | "raw" | "auto";
  public_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  tags?: string[];
  isAvatar?: boolean;
}

/**
 * Check if Cloudinary credentials are valid and reachable
 */
export const pingCloudinary = async (): Promise<boolean> => {
  try {
    const res = await cloudinary.v2.api.ping();
    return res?.status === "ok";
  } catch (err) {
    console.error("Cloudinary ping failed:", err);
    return false;
  }
};

/**
 * Generate responsive and optimized variant URLs adhering to Cloudinary best practices:
 * - c_fill,g_face for avatars so no face is ever cut off
 * - f_auto,q_auto for optimal format and bandwidth efficiency
 */
export const generateImageVariants = (
  publicId: string,
  isAvatar: boolean = false,
): MediaVariants => {
  if (isAvatar) {
    return {
      sm: cloudinary.v2.url(publicId, {
        secure: true,
        transformation: [
          { width: 150, height: 150, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      }),
      md: cloudinary.v2.url(publicId, {
        secure: true,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      }),
      lg: cloudinary.v2.url(publicId, {
        secure: true,
        transformation: [
          { width: 800, height: 800, crop: "fill", gravity: "face" },
          { fetch_format: "auto", quality: "auto" },
        ],
      }),
      original: cloudinary.v2.url(publicId, {
        secure: true,
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      }),
    };
  }

  return {
    sm: cloudinary.v2.url(publicId, {
      secure: true,
      transformation: [
        { width: 320, crop: "limit" },
        { fetch_format: "auto", quality: "auto" },
      ],
    }),
    md: cloudinary.v2.url(publicId, {
      secure: true,
      transformation: [
        { width: 720, crop: "limit" },
        { fetch_format: "auto", quality: "auto" },
      ],
    }),
    lg: cloudinary.v2.url(publicId, {
      secure: true,
      transformation: [
        { width: 1280, crop: "limit" },
        { fetch_format: "auto", quality: "auto" },
      ],
    }),
    original: cloudinary.v2.url(publicId, {
      secure: true,
      transformation: [{ fetch_format: "auto", quality: "auto" }],
    }),
  };
};

export const uploadImageToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResponse> => {
  try {
    const isConfigured =
      Boolean(process.env.CLOUDINARY_URL) ||
      (Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        Boolean(process.env.CLOUDINARY_API_SECRET));

    if (!isConfigured) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
      );
    }

    const {
      folder = "profile-images",
      transformation = {},
      resource_type = "image",
      public_id,
      overwrite = true,
      invalidate = true,
      tags,
      isAvatar = folder === "profile-images",
    } = options;

    return new Promise((resolve, reject) => {
      const uploadParams: any = {
        folder,
        resource_type,
        overwrite,
        invalidate,
      };

      if (public_id) uploadParams.public_id = public_id;
      if (tags && tags.length > 0) uploadParams.tags = tags;

      // Apply Cloudinary optimization best practices (f_auto, q_auto)
      if (transformation && Object.keys(transformation).length > 0) {
        uploadParams.transformation = {
          quality: "auto",
          fetch_format: "auto",
          ...transformation,
        };
      } else {
        uploadParams.transformation = {
          quality: "auto",
          fetch_format: "auto",
        };
      }

      const uploadStream = cloudinary.v2.uploader.upload_stream(
        uploadParams,
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Upload succeeded but no result returned"));
            return;
          }

          const variants = generateImageVariants(result.public_id, isAvatar);

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format || "",
            width: result.width || 0,
            height: result.height || 0,
            bytes: result.bytes || 0,
            variants,
          });
        },
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Upload any file (audio, PDF, raw docs) to Cloudinary.
 * Uses resource_type "video" for audio, "raw" for PDFs/docs.
 */
export const uploadFileToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResponse> => {
  try {
    const isConfigured =
      Boolean(process.env.CLOUDINARY_URL) ||
      (Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        Boolean(process.env.CLOUDINARY_API_SECRET));

    if (!isConfigured) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
      );
    }

    const { folder = "devotions", resource_type = "auto" } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder,
          resource_type,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Upload succeeded but no result returned"));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format || "",
            width: result.width || 0,
            height: result.height || 0,
            bytes: result.bytes || 0,
          });
        },
      );

      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("Cloudinary file upload error:", error);
    throw error;
  }
};

export const deleteImageFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> => {
  try {
    const isConfigured =
      Boolean(process.env.CLOUDINARY_URL) ||
      (Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        Boolean(process.env.CLOUDINARY_API_SECRET));

    if (!isConfigured) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
      );
    }

    await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export const getVideoThumbnailUrl = (publicId: string): string => {
  return cloudinary.v2.url(publicId, {
    resource_type: "video",
    secure: true,
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { fetch_format: "jpg" },
    ],
  });
};

/**
 * Extract public ID from any Cloudinary URL (images, audio, raw files).
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Matches /v<digits>/<public_id>.<extension>
    const match = url.match(/\/v\d+\/(.+)\.([a-zA-Z0-9]+)$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
