import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/octet-stream" ||
    /\.(jpg|jpeg|png|webp|heic|heif|gif)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const devotionFilesFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.fieldname === "image") {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image files are allowed for the cover image"));
  }

  if (file.fieldname === "media") {
    const allowedAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/m4a",
      "audio/x-m4a",
    ];

    if (
      allowedAudioTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("audio/")
    ) {
      return cb(null, true);
    }
    return cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. Devotion audio uploads accept: audio (mp3, wav, ogg, aac, m4a)`,
      ),
    );
  }

  // Any other file fields allowed
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB to easily accommodate camera photos
  },
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10);

export const uploadPosterImages = upload.any();

export const devotionUpload = multer({
  storage,
  fileFilter: devotionFilesFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export const uploadDevotionFiles = devotionUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "media", maxCount: 1 },
]);

export const videoUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "video" && file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }
    if (file.fieldname === "thumbnail" && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only video files and an optional image thumbnail are allowed"));
  },
  limits: {
    fileSize: 250 * 1024 * 1024,
    files: 2,
  },
});

export const uploadVideoFiles = videoUpload.fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
