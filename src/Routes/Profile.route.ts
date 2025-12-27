import express, { Router } from "express";
import requireAuth from "../utils/verifyToken.js";
import {
  GetProfileController,
  ProfileController,
  GetPeopleController,
} from "../Controllers/Profile.controller.js";
import upload from "../utils/multer.js";

const router: Router = express.Router();

router.post(
  "/profile",
  requireAuth,
  upload.single("picture"),
  ProfileController
);

router.get("/getProfile", requireAuth, GetProfileController);
router.get("/getPeople", requireAuth, GetPeopleController);

export default router;
