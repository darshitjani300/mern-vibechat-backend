import express, { Request, Response } from "express";
import Profile, { IProfilePicture } from "../Models/Profile.js";
import uploadToCloudinary from "../middlewares/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";

type Iuser = {
  name?: String;
  about?: String;
  picture?: IProfilePicture;
};

export const ProfileController = async (req: Request, res: Response) => {
  try {
    const { name, about } = req.body;
    const file = req.file;
    const user = (req as any).user;

    if (!user.userId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const updatedUser: Iuser = {};

    if (typeof name === "string" && name.trim() !== "") {
      updatedUser.name = name.trim();
    }

    if (typeof about === "string" && about.trim() !== "") {
      updatedUser.about = about.trim();
    }

    if (file) {
      const uploadResult: { secure_url: string; public_id: string } =
        (await uploadToCloudinary(file.buffer, "quickchat")) as {
          secure_url: string;
          public_id: string;
        };

      const existingProfile = await Profile.findOne({ userId: user.userId });

      if (existingProfile?.picture?.url) {
        await cloudinary.uploader.destroy(existingProfile?.picture?.public_id);
      }

      updatedUser.picture = {
        url: uploadResult?.secure_url,
        public_id: uploadResult?.public_id,
      };
    }

    if (Object.keys(updatedUser).length == 0) {
      return res.status(400).json({
        message: "At least one of name, about or picture is required.",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: updatedUser,
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      message: "Profile saved sucessfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetProfileController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const profile = await Profile.findOne({ userId: user.userId });

    return res.status(200).json({ message: "Profile found", profile });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const GetAllProfileController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(401).json({ message: "User is not authenticated." });
    }

    const profile = await Profile.find();
    return res.status(200).json({ message: "Success", profile });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
