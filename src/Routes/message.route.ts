import express from "express";
import requireAuth from "../utils/verifyToken.js";
import { GetMessageController } from "../Controllers/Message.controller.js";

const router = express.Router();

router.get("/:otherUserId", requireAuth, GetMessageController);

export default router;
