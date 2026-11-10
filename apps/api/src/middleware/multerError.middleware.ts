import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

export const handleMulterError = (
  err: Error | MulterError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 25MB per image.",
      });
    }
    return res
      .status(400)
      .json({ success: false, message: err.message || "File upload error" });
  }
  if (err) {
    return res
      .status(400)
      .json({ success: false, message: err.message || "File upload error" });
  }
  next();
};
