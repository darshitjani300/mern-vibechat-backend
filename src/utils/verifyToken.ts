import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;

  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
    (req as any).user = { userId: payload.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default requireAuth;
