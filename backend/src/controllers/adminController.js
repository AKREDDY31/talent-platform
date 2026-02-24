import prisma from "../config/prisma.js";

/**
 * Review a project (Admin Only)
 */
export const reviewProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { score, feedback } = req.body;

    // Basic validation
    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        message: "Score must be between 0 and 100"
      });
    }

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        score,
        feedback: feedback || ""
      }
    });

    res.json(updatedProject);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get all projects (Admin view)
 */
export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(projects);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Leaderboard (Sorted by score)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await prisma.project.findMany({
      where: {
        score: {
          not: null
        }
      },
      orderBy: {
        score: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(leaderboard);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};