import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

type TokenPayload = {
  userId: string;
  role: string;
};

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const payload: TokenPayload = {
      userId: decoded.userId,
      role: decoded.role,
    };

    req.user = payload;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}