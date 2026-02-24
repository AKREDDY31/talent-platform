import prisma from "../config/prisma.js";
import { generateCertificate } from "../utils/certificateGenerator.js";

// ===============================
// Utility: Validate GitHub URL
// ===============================
const isValidGithubUrl = (url) => {
  const regex = /^https?:\/\/(www\.)?github\.com\/[\w-]+(\/[\w-]+)?\/?$/;
  return regex.test(url);
};

// ===============================
// Submit Project
// ===============================
export const submitProject = async (req, res) => {
  try {
    const { title, githubLink } = req.body;

    if (!title || !githubLink) {
      return res.status(400).json({
        success: false,
        message: "Title and GitHub link are required"
      });
    }

    if (!isValidGithubUrl(githubLink)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GitHub URL"
      });
    }

    const cleanedTitle = title.trim();
    const cleanedLink = githubLink.trim();

    const existingProject = await prisma.project.findFirst({
      where: {
        title: cleanedTitle,
        userId: req.user.id
      }
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this title already submitted"
      });
    }

    const project = await prisma.project.create({
      data: {
        title: cleanedTitle,
        githubLink: cleanedLink,
        userId: req.user.id
      }
    });

    return res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: project
    });

  } catch (error) {
    console.error("Submit Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ===============================
// Get My Projects
// ===============================
export const getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });

  } catch (error) {
    console.error("Get My Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ===============================
// Public Leaderboard
// ===============================
export const getPublicLeaderboard = async (req, res) => {
  try {
    const leaderboard = await prisma.project.findMany({
      where: {
        score: { not: null }
      },
      orderBy: {
        score: "desc"
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ===============================
// Download Certificate
// ===============================
export const downloadCertificate = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });

    if (!project || project.score === null) {
      return res.status(400).json({
        success: false,
        message: "Certificate not available yet"
      });
    }

    generateCertificate(
      res,
      project.user.name,
      project.title,
      project.score
    );

  } catch (error) {
    console.error("Certificate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};