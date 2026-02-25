import express from "express";
import {
  getChatMessages,
  getProblemStatement,
  sendChatMessage,
  updateProblemStatement,
} from "../controllers/platformController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/problem-statement", protect, getProblemStatement);
router.put("/problem-statement", protect, adminOnly, updateProblemStatement);

router.get("/chat/messages", protect, getChatMessages);
router.post("/chat/messages", protect, sendChatMessage);

export default router;
