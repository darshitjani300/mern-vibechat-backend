import jwt, { Secret } from "jsonwebtoken";
import User from "../Models/auth/Signup.js";
import { CookieOptions, Request, Response } from "express";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "../utils/auth.utils.js";

export const RefreshTokenController = async (req: Request, res: Response) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as Secret;

  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({ message: "No refresh token Outer" });
    }

    try {
      const payload: any = jwt.verify(token, REFRESH_TOKEN_SECRET);

      const user = await User.findById(payload.userId);
      if (!user)
        return res
          .status(401)
          .json({ message: "Invalid refresh token Innder" });

      // Compare the refresh token
      const tokenHash = hashToken(token);
      if (!user.refreshToken || user.refreshToken !== tokenHash)
        return res.status(401).json({ message: "Refresh token revoked" });

      // Issue a new access token now.
      const accessToken = signAccessToken({
        userId: user._id,
        email: user.email,
      });

      // Rotate refresh token: create a new refresh token and replace the one in db and cookie.
      const newRefreshtoken = signRefreshToken({
        userId: user.id,
        email: user.email,
      });
      user.refreshToken = hashToken(newRefreshtoken);
      await user.save();

      const isProd = process.env.NODE_ENV === "production";
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: isProd, // MUST be true in prod
        sameSite: isProd ? "none" : "lax", // MUST be "none" in prod
      };

      res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 1 * 60 * 60 * 1000,
      });

      res.cookie("refresh_token", newRefreshtoken, {
        ...cookieOptions,
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Token refreshed" });
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token HERRE bro" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
