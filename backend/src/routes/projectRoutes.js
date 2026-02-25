import express from "express";
import rateLimit from "express-rate-limit";

import {
  submitProject,
  getMyProjects,
  getPublicLeaderboard,
  downloadCertificate,
  getMyProjectTracking,
  submitPresentationLink,
  verifyPublicCertificate,
  downloadPublicCertificate,
} from "../controllers/projectController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const projectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

router.post("/", protect, projectLimiter, submitProject);
router.get("/mine", protect, getMyProjects);
router.get("/tracking", protect, getMyProjectTracking);
router.patch("/:projectId/presentation", protect, submitPresentationLink);
router.get("/certificate/:projectId", protect, downloadCertificate);

router.get("/public/certificate/verify", verifyPublicCertificate);
router.get("/public/certificate/:projectId/download", downloadPublicCertificate);

router.get("/leaderboard", getPublicLeaderboard);

export default router;
