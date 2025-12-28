import { Request, Response } from "express";
import Message from "../Models/Message.js";
import mongoose from "mongoose";

export const GetMessageController = async (req: Request, res: Response) => {
  try {
    const myId = (req as any).user;
    const otherId = req.params?.otherUserId;

    if (!myId.userId || !otherId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId.userId, receiver: otherId },
        { sender: otherId, receiver: myId.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(500);

    return res.status(200).json({ message: "Success", messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
