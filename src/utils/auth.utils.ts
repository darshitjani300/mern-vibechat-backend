import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as Secret;

export function signAccessToken(payload: object) {
  // short lifetime
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: object) {
  // long lifetime
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export function hashToken(token: string) {
  // Hash the token
  return crypto.createHash("sha256").update(token).digest("hex");
}
