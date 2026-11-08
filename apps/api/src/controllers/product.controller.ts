import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ProductService } from "../services/product.service.js";
import { uploadImageToCloudinary } from "../services/cloudinary.service.js";
import { routeParam } from "../utils/routeParam.js";

export class ProductController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string) || 20),
      );
      const category = (req.query.category as string) || undefined;

      const result = await ProductService.getAll(page, limit, category);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const product = await ProductService.getById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, shortDescription, price, imageUrls, stock, category } =
        req.body;

      let finalImageUrls: string[] = [];
      if (Array.isArray(imageUrls)) {
        finalImageUrls = [...imageUrls];
      } else if (typeof imageUrls === "string") {
        try {
          const parsed = JSON.parse(imageUrls);
          finalImageUrls = Array.isArray(parsed) ? [...parsed] : [imageUrls];
        } catch {
          if (imageUrls.trim()) finalImageUrls = [imageUrls.trim()];
        }
      }

      // Handle file uploads
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
          const folder = category
            ? `marketplace/${category.toLowerCase().replace(/\s+/g, "-")}`
            : "marketplace/others";

          const uploadPromises = (req.files as Express.Multer.File[]).map(
            (file) => uploadImageToCloudinary(file.buffer, { folder }),
          );

          const uploadResults = await Promise.all(uploadPromises);
          const uploadedUrls = uploadResults.map((result) => result.secure_url);
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        } catch (uploadError: any) {
          console.error("Cloudinary Upload Failed:", uploadError);
          return res.status(503).json({
            success: false,
            message:
              "Image upload service (Cloudinary) is temporarily unavailable. Please check your internet connection.",
            error: uploadError.message,
          });
        }
      }

      if (finalImageUrls.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "At least one image is required" });
      }

      const isActiveVal =
        req.body.isActive !== undefined
          ? String(req.body.isActive) === "true" || req.body.isActive === true
          : true;

      const product = await ProductService.create({
        title,
        shortDescription,
        price,
        imageUrls: finalImageUrls,
        stock: parseInt(stock as string) || 0,
        category: category || "other",
        isActive: isActiveVal,
      });
      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const existing = await ProductService.getById(id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const { title, shortDescription, price, imageUrls, stock, category, isActive } =
        req.body;
      let parsedBodyImages: string[] | undefined = undefined;
      if (Array.isArray(imageUrls)) {
        parsedBodyImages = [...imageUrls];
      } else if (typeof imageUrls === "string") {
        try {
          const parsed = JSON.parse(imageUrls);
          parsedBodyImages = Array.isArray(parsed) ? [...parsed] : [imageUrls];
        } catch {
          if (imageUrls.trim()) parsedBodyImages = [imageUrls.trim()];
        }
      }

      let finalImageUrls = parsedBodyImages;

      // Handle file uploads if any
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const cat = category || existing.category || "other";
        const folder = `marketplace/${cat.toLowerCase().replace(/\s+/g, "-")}`;

        const uploadPromises = (req.files as Express.Multer.File[]).map(
          (file) => uploadImageToCloudinary(file.buffer, { folder }),
        );

        const uploadResults = await Promise.all(uploadPromises);
        const uploadedUrls = uploadResults.map((result) => result.secure_url);

        const baseImages = parsedBodyImages !== undefined ? parsedBodyImages : (existing.imageUrls || []);
        finalImageUrls = [...baseImages, ...uploadedUrls];
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
      if (price !== undefined) updateData.price = parseFloat(price as string);
      if (finalImageUrls !== undefined) updateData.imageUrls = finalImageUrls;
      if (stock !== undefined) updateData.stock = parseInt(stock as string);
      if (category !== undefined) updateData.category = category;
      if (isActive !== undefined) {
        updateData.isActive = String(isActive) === "true" || isActive === true;
      }

      const product = await ProductService.update(id, updateData);
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    try {
      const id = routeParam(req.params.id);
      const existing = await ProductService.getById(id);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      await ProductService.remove(id);
      return res
        .status(200)
        .json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }
}

export default ProductController;
