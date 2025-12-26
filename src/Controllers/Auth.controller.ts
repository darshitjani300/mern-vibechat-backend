import { Request, Response } from "express";
import PasswordReset, { IPasswordReset } from "../Models/auth/PasswordReset.js";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { getResetPasswordEmail } from "../emails/index.js";
import sendEmail from "../middlewares/nodemail.js";
import User, { IUser } from "../Models/auth/Signup.js";
import {
  ForgetRequestBody,
  ForgetResponseBody,
  LoginRequestBody,
  LoginResponseBody,
  ResetRequestBody,
  ResetResponseBody,
  SignupRequestBody,
  SignupResponseBody,
} from "../types/auth.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "../utils/auth.utils.js";
dotenv.config();

const SignupController = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response<SignupResponseBody>
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        ?.status(400)
        ?.json({ message: "All the fields are required." });
    }

    const userExist = await User?.findOne({ email });
    if (userExist) {
      return res?.status(409)?.json({
        message: "User already exists.",
      });
    }

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User<IUser>({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const accessToken = signAccessToken({
      userId: newUser.id,
      email: newUser.email,
    });

    const refreshToken = signRefreshToken({
      userId: newUser.id,
      email: newUser.email,
    });

    newUser.refreshToken = hashToken(refreshToken);
    await newUser.save();

    // Cookie options
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      secure: isProd,
      httpOnly: true,
      sameSite: "lax" as "lax",
    };

    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res
        ?.status(500)
        ?.json({ message: "Internal server Error", error: error.message });
    }
  }
};

const LoginController = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response<LoginResponseBody>
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All the fields are required" });
    }

    let existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(409).json({ message: "User does not exists" });
    }

    //compare password.
    const validPassword = await bcrypt.compare(password, existUser.password);
    if (!validPassword) {
      return res.status(409).json({ message: "Enter valid password" });
    }

    const accessToken = signAccessToken({ userId: existUser?.id, email });
    const refreshToken = signRefreshToken({ userId: existUser?.id, email });

    existUser.refreshToken = hashToken(refreshToken);
    await existUser.save();

    // Cookie options
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as "lax",
    };

    // Set cookies
    // --> access token first
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    // --> refresh token second
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "User Login sucessfull",
      data: {
        userId: existUser.id,
        email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const ForgotPassword = async (
  req: Request<{}, {}, ForgetRequestBody>,
  res: Response<ForgetResponseBody>
) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    //Create a random token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    //Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordReset.deleteMany({ user: user._id });

    const resetEntry: IPasswordReset = new PasswordReset({
      user: user._id,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 15 * 60 * 1000,
    });

    await resetEntry.save();

    const resetUrl = `${process.env.CLIENT_URL}/resetpassword?token=${rawToken}`;
    const html = getResetPasswordEmail(resetUrl);

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html,
    });

    res.json({ message: "Reset password email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset Email" });
  }
};

const ResetPassword = async (
  req: Request<{}, {}, ResetRequestBody>,
  res: Response<ResetResponseBody>
) => {
  const { password, confirmPassword, token } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetEntry = await PasswordReset.findOne({
      resetPasswordExpire: { $gt: Date.now() },
      resetPasswordToken: hashedToken,
      used: false,
    });

    if (!resetEntry) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token. Please request a new password reset",
      });
    }

    const user = await User.findOne({ _id: resetEntry.user });

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    resetEntry.used = true;
    await resetEntry.save();

    return res.status(200).json({
      message:
        "Password Reset Sucessfully, You can login with your new password",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error while resetting password." });
  }
};

const LogoutController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refresh_token;

    if (token) {
      try {
        const payload: any = jwt.verify(
          token,
          process.env.REFRESH_TOKEN_SECRET as Secret
        );

        await User.findOneAndUpdate(payload.userId, {
          $unset: { refreshToken: null },
        });
      } catch (error) {
        console.log("Error verifying token:", error);
      }
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.status(200).json({ message: "Logged out", status: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const CheckAuthController = async (req: Request, res: Response) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "No access token" });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }

    const user = await User.findById(payload.userId).select(
      "_id email username"
    );
    if (!user) return res.status(401).json({ message: "User not found" });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("CheckAuth error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  SignupController,
  LoginController,
  ForgotPassword,
  ResetPassword,
  LogoutController,
  CheckAuthController,
};
