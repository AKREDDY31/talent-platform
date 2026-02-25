import prisma from "../config/prisma.js";
import { buildCertificateNumber, generateCertificate } from "../utils/certificateGenerator.js";
import {
  isValidGithubUrl,
  toNullableString,
  toSafeString,
} from "../utils/validation.js";

const PUBLIC_SORT_COLUMNS = {
  score: "score",
  createdAt: "createdAt",
  title: "title",
};

export const submitProject = async (req, res) => {
  try {
    const title = toSafeString(req.body.title, 180);
    const githubLink = toSafeString(req.body.githubLink, 300);

    if (!title || !githubLink) {
      return res.status(400).json({ success: false, message: "Title and GitHub link are required" });
    }

    if (!isValidGithubUrl(githubLink)) {
      return res.status(400).json({ success: false, message: "Please provide a valid GitHub repository URL" });
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        title,
        userId: req.user.id,
      },
    });

    if (existingProject) {
      return res.status(409).json({ success: false, message: "You already submitted a project with this title" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        githubLink,
        demoLink: toNullableString(req.body.demoLink, 300),
        description: toNullableString(req.body.description, 1200),
        techStack: toNullableString(req.body.techStack, 500),
        userId: req.user.id,
      },
    });

    return res.status(201).json({ success: true, message: "Project submitted successfully", data: project });
  } catch (error) {
    console.error("submitProject", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error("getMyProjects", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyProjectTracking = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        githubLink: true,
        status: true,
        isOpened: true,
        nextStagePassed: true,
        score: true,
        feedback: true,
        presentationLink: true,
        technicalInterviewAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const normalized = projects.map((project) => ({
      ...project,
      certificateEligible: project.score !== null && project.score >= 50,
      technicalInterviewEligible: project.status === "SHORTLISTED",
    }));

    return res.json({ success: true, data: normalized });
  } catch (error) {
    console.error("getMyProjectTracking", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const submitPresentationLink = async (req, res) => {
  try {
    const { projectId } = req.params;
    const presentationLink = toNullableString(req.body.presentationLink, 400);

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status !== "SHORTLISTED") {
      return res.status(400).json({ success: false, message: "Presentation link allowed only for shortlisted projects" });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        presentationLink,
      },
    });

    return res.json({ success: true, data: updated, message: "Technical interview preparation link saved" });
  } catch (error) {
    console.error("submitPresentationLink", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getPublicLeaderboard = async (req, res) => {
  try {
    const sortBy = PUBLIC_SORT_COLUMNS[req.query.sortBy] || "score";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const rows = await prisma.project.findMany({
      where: {
        score: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ [sortBy]: order }, { createdAt: "desc" }],
    });

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("getPublicLeaderboard", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.score === null || project.score < 50) {
      return res.status(400).json({ success: false, message: "Certificate available only for projects scored 50 or above" });
    }

    const issuedAt = project.updatedAt || project.createdAt || new Date();
    const certificateNumber = buildCertificateNumber({ projectId: project.id, userId: project.user.id });
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationUrl = `${frontendBaseUrl}/certificate/verify?projectId=${project.id}&certificateNumber=${certificateNumber}`;

    await generateCertificate(res, {
      userName: project.user.name,
      userEmail: project.user.email,
      projectTitle: project.title,
      projectLink: project.githubLink,
      score: project.score,
      issuedAt,
      projectId: project.id,
      userId: project.user.id,
      verificationUrl,
    });
  } catch (error) {
    console.error("downloadCertificate", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyPublicCertificate = async (req, res) => {
  try {
    const projectId = toSafeString(req.query.projectId, 120);
    const certificateNumber = toSafeString(req.query.certificateNumber, 120);

    if (!projectId || !certificateNumber) {
      return res.status(400).json({ success: false, message: "projectId and certificateNumber are required" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project || project.score === null || project.score < 50) {
      return res.status(404).json({ success: false, message: "Certificate not found or not eligible" });
    }

    const expectedNumber = buildCertificateNumber({ projectId: project.id, userId: project.user.id });
    if (certificateNumber !== expectedNumber) {
      return res.status(400).json({ success: false, message: "Invalid certificate number" });
    }

    return res.json({
      success: true,
      data: {
        certificateNumber: expectedNumber,
        issuedAt: project.updatedAt || project.createdAt,
        candidateName: project.user.name,
        candidateEmail: project.user.email,
        projectTitle: project.title,
        projectLink: project.githubLink,
        score: project.score,
      },
    });
  } catch (error) {
    console.error("verifyPublicCertificate", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const downloadPublicCertificate = async (req, res) => {
  try {
    const { projectId } = req.params;
    const certificateNumber = toSafeString(req.query.certificateNumber, 120);

    if (!certificateNumber) {
      return res.status(400).json({ success: false, message: "certificateNumber is required" });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project || project.score === null || project.score < 50) {
      return res.status(404).json({ success: false, message: "Certificate not found or not eligible" });
    }

    const expectedNumber = buildCertificateNumber({ projectId: project.id, userId: project.user.id });
    if (certificateNumber !== expectedNumber) {
      return res.status(400).json({ success: false, message: "Invalid certificate number" });
    }

    const issuedAt = project.updatedAt || project.createdAt || new Date();
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationUrl = `${frontendBaseUrl}/certificate/verify?projectId=${project.id}&certificateNumber=${expectedNumber}`;

    await generateCertificate(res, {
      userName: project.user.name,
      userEmail: project.user.email,
      projectTitle: project.title,
      projectLink: project.githubLink,
      score: project.score,
      issuedAt,
      projectId: project.id,
      userId: project.user.id,
      verificationUrl,
    });
  } catch (error) {
    console.error("downloadPublicCertificate", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
