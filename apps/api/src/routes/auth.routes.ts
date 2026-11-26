import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../platform/auth.js";
import { uploadSingle } from "../middleware/upload.middleware.js";
import { handleMulterError } from "../middleware/multerError.middleware.js";

const router = Router();

const phoneLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many phone lookup attempts. Please try again later.",
  },
});

router.post(
  "/signup",
  uploadSingle,
  handleMulterError,
  AuthController.register,
);
router.post("/signin", AuthController.login);
router.post(
  "/lookup-by-phone",
  phoneLookupLimiter,
  optionalAuth,
  AuthController.lookupByPhone,
);
router.get("/me", requireAuth, AuthController.getMe);
router.patch(
  "/profile",
  requireAuth,
  uploadSingle,
  handleMulterError,
  AuthController.updateProfile,
);
router.post("/phone/send-otp", AuthController.sendPhoneAuthOtp);
router.post("/phone/verify-otp", AuthController.verifyPhoneAuthOtp);
router.post("/update-phone", requireAuth, AuthController.updatePhone);
router.post("/change-password", requireAuth, AuthController.changePassword);
router.post("/request-otp", AuthController.requestOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password", AuthController.resetPassword);
router.delete("/account", requireAuth, AuthController.deleteAccount);

export default router;

