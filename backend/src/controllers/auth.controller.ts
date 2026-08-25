import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { Resend } from "resend";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        country: country ? String(country).trim() : null,
        settings: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        role: true,
        level: true,
        xp: true,
        streak: true,
        bestWpm: true,
        averageWpm: true,
        averageAccuracy: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      role: user.role,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      bestWpm: user.bestWpm,
      averageWpm: user.averageWpm,
      averageAccuracy: user.averageAccuracy,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
}

export async function forgotPassword(
  req: Request,
  res: Response
) {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Don't reveal whether the email exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been generated.",
      });
    }

    // Remove old unused reset tokens.
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate secure reset token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires after 30 minutes.
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Production Vercel reset page.
    const resetLink =
      `https://type-master-6d09a8wnw-type-master-team.vercel.app/reset-password?token=${rawToken}`;

    // Resend API key.
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);

    console.log(
      "FORGOT PASSWORD: sending email to",
      email
    );

    // Send email using Resend HTTPS API.
    const { data, error } = await resend.emails.send({
      from: "TypeMaster <onboarding@resend.dev>",
      to: [email],
      subject: "TypeMaster Password Reset",
      text: `Reset your TypeMaster password using this link: ${resetLink}`,
      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
          "
        >
          <h2>TypeMaster Password Reset</h2>

          <p>
            You requested a password reset for your TypeMaster account.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p>
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This link expires in 30 minutes.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message);
    }

    console.log(
      "FORGOT PASSWORD: email sent successfully",
      data?.id
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been generated.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request.",
    });
  }
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  try {
    const token =
      typeof req.body.token === "string"
        ? req.body.token
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
        },
      }),

      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
    });
  }
}