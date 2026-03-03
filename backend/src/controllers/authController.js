import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import {
  isValidEmail,
  isValidPassword,
  toNullableInt,
  toNullableString,
  toSafeString,
} from "../utils/validation.js";
import { sendEmail } from "../utils/emailService.js";

const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  college: user.college,
  graduationYear: user.graduationYear,
  skills: user.skills,
});

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      adminInviteCode,
      phone,
      college,
      graduationYear,
      skills,
      bio,
    } = req.body;

    const cleanName = toSafeString(name, 120);
    const cleanEmail = toSafeString(email, 160).toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars and include uppercase, lowercase, number, and special character",
      });
    }

    const selectedRole = role === "ADMIN" ? "ADMIN" : "USER";

    if (selectedRole === "ADMIN") {
      if (!process.env.ADMIN_INVITE_CODE || adminInviteCode !== process.env.ADMIN_INVITE_CODE) {
        return res.status(403).json({ message: "Invalid admin invite code" });
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: selectedRole,
        phone: toNullableString(phone, 30),
        college: toNullableString(college, 180),
        graduationYear: toNullableInt(graduationYear),
        skills: toNullableString(skills, 400),
        bio: toNullableString(bio, 800),
      },
    });

    return res.status(201).json({
      message: `${selectedRole === "ADMIN" ? "Admin" : "User"} registered successfully`,
      token: signToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const email = toSafeString(req.body.email, 160).toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({ token: signToken(user), user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        college: true,
        graduationYear: true,
        skills: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = toSafeString(req.body.email, 160).toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Keep response generic to avoid email enumeration.
    if (!user) {
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt,
        userId: user.id,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    let mailResult;
    try {
      mailResult = await sendEmail({
        to: user.email,
        subject: "Reset your Talent Platform password",
        html: `<p>Hi ${user.name},</p><p>Use this link to reset your password (valid for 30 minutes):</p><p><a href=\"${resetLink}\">Reset Password</a></p>`,
      });
    } catch (mailError) {
      console.error("[forgot-password] sendEmail exception", {
        email: user.email,
        error: mailError.message,
      });
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    if (!mailResult?.delivered) {
      console.error("[forgot-password] mail delivery failed", {
        reason: mailResult?.reason || "unknown",
        email: user.email,
      });
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    return res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("[forgot-password] unexpected error", error);
    return res.status(500).json({
      message: "Failed to start password reset",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = toSafeString(req.body.token, 200);
    const password = req.body.password || "";

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars and include uppercase, lowercase, number, and special character",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetEntry = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetEntry || resetEntry.usedAt || resetEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetEntry.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetEntry.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};
