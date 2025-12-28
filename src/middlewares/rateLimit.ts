import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attemps. Please try again later.",
  },
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

export const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts, please try again later",
  },
});
