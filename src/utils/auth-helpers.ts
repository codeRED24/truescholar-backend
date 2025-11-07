import { Response } from "express";
import { sign } from "jsonwebtoken";

export const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? "none" : "lax", // Conditionally set SameSite
    expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? "none" : "lax", // Conditionally set SameSite
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
  });
};

export const generateTokens = (userId: number, email: string) => {
  const accessToken = sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = sign({ userId, email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
