import express from "express";
import {
  reviewProject,
  getAllProjects,
  getLeaderboard
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all projects (admin view)
router.get("/projects", protect, adminOnly, getAllProjects);

// Review / score a project
router.put("/projects/:projectId", protect, adminOnly, reviewProject);

// Leaderboard (admin view)
router.get("/leaderboard", protect, adminOnly, getLeaderboard);

export default router;