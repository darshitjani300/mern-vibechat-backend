import express from "express";
import requireAuth from "../utils/verifyToken.js";
import { GetMessageController } from "../Controllers/Message.controller.js";
import { messageLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.get("/:otherUserId", messageLimiter, requireAuth, GetMessageController);

export default router;
