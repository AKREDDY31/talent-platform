import express from "express";
import rateLimit from "express-rate-limit";

import {
  submitProject,
  getMyProjects,
  getPublicLeaderboard,
  downloadCertificate
} from "../controllers/projectController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate limiter (prevents spam submissions)
const projectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

// =======================
// Protected Routes
// =======================

// Submit project
router.post("/", protect, projectLimiter, submitProject);

// Get logged-in user's projects
router.get("/mine", protect, getMyProjects);

// Download certificate
router.get("/certificate/:projectId", protect, downloadCertificate);

// =======================
// Public Routes
// =======================

// Public leaderboard
router.get("/leaderboard", getPublicLeaderboard);

export default router;