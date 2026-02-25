import prisma from "../config/prisma.js";

export const getLeaderboard = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { score: { not: null } },
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

    const byUser = new Map();

    for (const project of projects) {
      const current = byUser.get(project.user.id) || {
        id: project.user.id,
        name: project.user.name,
        email: project.user.email,
        totalScore: 0,
        projectCount: 0,
        averageScore: 0,
      };

      current.totalScore += project.score || 0;
      current.projectCount += 1;
      current.averageScore = Number((current.totalScore / current.projectCount).toFixed(2));
      byUser.set(project.user.id, current);
    }

    const leaderboard = Array.from(byUser.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.averageScore - a.averageScore;
    });

    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
