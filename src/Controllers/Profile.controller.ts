import express, { Request, Response } from "express";
import Profile, { IProfilePicture } from "../Models/Profile.js";
import uploadToCloudinary from "../middlewares/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";

type IProfile = {
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

    const updatedProfile: IProfile = {};

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length >= 3 && trimmed.length <= 30) {
        updatedProfile.name = trimmed;
      }
    }

    if (typeof about === "string") {
      const trimmed = about.trim();
      if (trimmed.length >= 1 && trimmed.length <= 120) {
        updatedProfile.about = trimmed;
      }
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

      updatedProfile.picture = {
        url: uploadResult?.secure_url,
        public_id: uploadResult?.public_id,
      };
    }

    if (Object.keys(updatedProfile).length == 0) {
      return res.status(400).json({
        message: "At least one of name, about or picture is required.",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: user.userId },
      {
        $set: updatedProfile,
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

export const GetPeopleController = async (req: Request, res: Response) => {
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
