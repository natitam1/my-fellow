import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadImageToCloudinary } from "../src/services/cloudinary.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Ensure public/assets directory exists in api
  const publicAssetsDir = path.resolve(__dirname, "../public/assets");
  if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
  }

  const destPath = path.join(publicAssetsDir, "logo-primary.png");

  // Candidate source paths across monorepo layouts and working directories
  const candidateSources = [
    path.resolve(__dirname, "../../my-fellow/assets/images/logo-primary.png"),
    path.resolve(process.cwd(), "../my-fellow/assets/images/logo-primary.png"),
    path.resolve(process.cwd(), "my-fellow/assets/images/logo-primary.png"),
    path.resolve(process.cwd(), "public/assets/logo-primary.png"),
    destPath,
  ];

  const sourceLogoPath = candidateSources.find((p) => fs.existsSync(p));

  if (!sourceLogoPath && !fs.existsSync(destPath)) {
    console.error("Local logo not found in any candidate locations:", candidateSources);
    process.exit(1);
  }

  if (sourceLogoPath && sourceLogoPath !== destPath) {
    fs.copyFileSync(sourceLogoPath, destPath);
    console.log(`Copied local logo from ${sourceLogoPath} to: ${destPath}`);
  } else {
    console.log(`Official logo verified at destination: ${destPath}`);
  }

  // Upload to Cloudinary if credentials present (with timeout for idempotency and resilience)
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const fileBuffer = fs.readFileSync(destPath);
      console.log("Uploading logo to Cloudinary...");
      const uploadPromise = uploadImageToCloudinary(fileBuffer, {
        folder: "fellowship-official",
        resource_type: "image",
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Cloudinary upload timed out after 5s")), 5000)
      );
      const res = await Promise.race([uploadPromise, timeoutPromise]);
      console.log("Cloudinary Upload Success!");
      console.log("URL:", res.secure_url);
    } catch (err: any) {
      console.warn("Cloudinary upload failed or not configured, using local fallback:", err.message);
    }
  } else {
    console.log("Cloudinary credentials not provided; using local assets fallback.");
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
