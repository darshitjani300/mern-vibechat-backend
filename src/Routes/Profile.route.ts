import express, { Router } from "express";
import requireAuth from "../utils/verifyToken.js";
import {
  GetProfileController,
  ProfileController,
  GetPeopleController,
} from "../Controllers/Profile.controller.js";
import upload from "../utils/multer.js";
import { profileLimiter } from "../middlewares/rateLimit.js";

const router: Router = express.Router();

router.post(
  "/profile",
  profileLimiter,
  requireAuth,
  upload.single("picture"),
  ProfileController
);

router.get("/getProfile", requireAuth, profileLimiter, GetProfileController);
router.get("/getPeople", requireAuth, profileLimiter, GetPeopleController);

export default router;
