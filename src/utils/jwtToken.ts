import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiError from "./apiError";

dotenv.config();

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT Secret is required.");
  }

  const token = jwt.sign({ userId }, secret, {
    algorithm: "HS256", // Use HMAC SHA-256
  });
  return token;
};

export const authenticateToken = (token: string) => {
  token = token.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Access Token Required");
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT Secret is required.");
  }

  try {
    const payload: any = jwt.verify(token, secret); // Verify and decode token
    return payload.userId;
  } catch (error) {
    throw new ApiError(403, "Invlaid Token Required");
  }
};
