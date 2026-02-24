import prisma from "../config/prisma.js";

export const getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        projects: true
      }
    });

    const leaderboard = users.map((user) => {
      const totalScore = user.projects.reduce(
        (sum, project) => sum + (project.score || 0),
        0
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalScore,
        projectCount: user.projects.length
      };
    });

    // Sort descending
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    res.json(leaderboard);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};