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

const router: Router = express.Router();

router.post("/signup", validateSchema(registerSchema), SignupController);
router.post("/login", validateSchema(loginSchema), LoginController);
router.post("/forgotPassword", ForgotPassword);
router.post("/resetPassword", ResetPassword);
router.post("/refresh", RefreshTokenController);
router.post("/logout", LogoutController);
router.get("/me", CheckAuthController);

export default router;
