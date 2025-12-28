import express, { Router } from "express";
import {
  CheckAuthController,
  ForgotPassword,
  LoginController,
  LogoutController,
  ResetPassword,
  SignupController,
} from "../Controllers/Auth.controller.js";
import validateSchema from "../middlewares/validator.js";
import { loginSchema, registerSchema } from "../validators/auth.schema.js";
import { RefreshTokenController } from "../Controllers/Refresh.controller.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router: Router = express.Router();

router.post(
  "/signup",
  authLimiter,
  validateSchema(registerSchema),
  SignupController
);
router.post(
  "/login",
  authLimiter,
  validateSchema(loginSchema),
  LoginController
);
router.post("/forgotPassword", ForgotPassword);
router.post("/resetPassword", ResetPassword);
router.post("/refresh", RefreshTokenController);
router.post("/logout", LogoutController);
router.get("/me", CheckAuthController);

export default router;
