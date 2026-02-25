import prisma from "../config/prisma.js";
import { toNullableString, toSafeString } from "../utils/validation.js";

export const getProblemStatement = async (req, res) => {
  try {
    const statement = await prisma.problemStatement.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      success: true,
      data: {
        content: statement?.content || "",
        updatedAt: statement?.updatedAt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch problem statement" });
  }
};

export const updateProblemStatement = async (req, res) => {
  try {
    const content = toNullableString(req.body.content, 4000);

    const latest = await prisma.problemStatement.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    let saved;
    if (!latest) {
      saved = await prisma.problemStatement.create({
        data: {
          content,
          updatedBy: req.user.id,
        },
      });
    } else {
      saved = await prisma.problemStatement.update({
        where: { id: latest.id },
        data: {
          content,
          updatedBy: req.user.id,
        },
      });
    }

    return res.json({ success: true, data: saved, message: "Problem statement updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update problem statement" });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load chat messages" });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const message = toSafeString(req.body.message, 500);

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const created = await prisma.chatMessage.create({
      data: {
        message,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
