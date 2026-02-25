import prisma from "../config/prisma.js";
import { sendEmail } from "../utils/emailService.js";
import { toNullableString } from "../utils/validation.js";

const VALID_STATUSES = new Set(["SUBMITTED", "OPENED", "SHORTLISTED", "REJECTED"]);

const nextStageFromStatus = (status) => {
  if (status === "SHORTLISTED") return true;
  if (status === "REJECTED") return false;
  return null;
};

const buildStatusEmail = ({ name, projectTitle, status, feedback, score }) => {
  const heading =
    status === "SHORTLISTED"
      ? "Great news! Your project moved to the next stage"
      : status === "REJECTED"
      ? "Update on your project submission"
      : "Your project status has been updated";

  return `<p>Hi ${name},</p>
  <p>${heading}</p>
  <p><strong>Project:</strong> ${projectTitle}</p>
  <p><strong>Status:</strong> ${status}</p>
  <p><strong>Score:</strong> ${score ?? "Pending"}</p>
  <p><strong>Feedback:</strong> ${feedback || "No feedback provided yet."}</p>
  <p>Login to your dashboard for full tracking details.</p>`;
};

export const getDashboardSummary = async (req, res) => {
  try {
    const [usersCount, projectsCount, reviewedCount, shortlistedCount] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.project.count(),
      prisma.project.count({ where: { score: { not: null } } }),
      prisma.project.count({ where: { status: "SHORTLISTED" } }),
    ]);

    return res.json({
      usersCount,
      projectsCount,
      reviewedCount,
      shortlistedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load summary", error: error.message });
  }
};

export const reviewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { score, feedback, status, notifyUser } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const payload = {};

    if (score !== undefined && score !== null && score !== "") {
      const numericScore = Number(score);
      if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
        return res.status(400).json({ message: "Score must be between 0 and 100" });
      }
      payload.score = Math.round(numericScore);
    }

    if (feedback !== undefined) {
      payload.feedback = toNullableString(feedback, 2000);
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      payload.status = status;
      payload.isOpened = status !== "SUBMITTED";
      payload.nextStagePassed = nextStageFromStatus(status);
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: payload,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (notifyUser) {
      await sendEmail({
        to: updatedProject.user.email,
        subject: `Project status update: ${updatedProject.title}`,
        html: buildStatusEmail({
          name: updatedProject.user.name,
          projectTitle: updatedProject.title,
          status: updatedProject.status,
          feedback: updatedProject.feedback,
          score: updatedProject.score,
        }),
      });
    }

    return res.json(updatedProject);
  } catch (error) {
    return res.status(500).json({ message: "Failed to review project", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            graduationYear: true,
          },
        },
      },
    });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await prisma.project.findMany({
      where: { score: { not: null } },
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leaderboard", error: error.message });
  }
};

export const notifyProjectUser = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { subject, message } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    await sendEmail({
      to: project.user.email,
      subject: String(subject).slice(0, 200),
      html: `<p>Hi ${project.user.name},</p><p>${String(message).slice(0, 4000)}</p>`,
    });

    return res.json({ message: "Notification sent" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send notification", error: error.message });
  }
};
