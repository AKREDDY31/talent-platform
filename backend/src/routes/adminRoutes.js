import express from "express";
import {
  reviewProject,
  getAllProjects,
  getLeaderboard,
  getDashboardSummary,
  notifyProjectUser,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, adminOnly, getDashboardSummary);
router.get("/projects", protect, adminOnly, getAllProjects);
router.put("/projects/:projectId", protect, adminOnly, reviewProject);
router.post("/projects/:projectId/notify", protect, adminOnly, notifyProjectUser);
router.get("/leaderboard", protect, adminOnly, getLeaderboard);

export default router;
