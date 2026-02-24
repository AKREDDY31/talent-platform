"use client";

export default function Home() {
  return (
    <div className="hero">
      <h1>Talent Platform </h1>

      <p>
        A structured internship and real-world project evaluation platform
        that enables students to demonstrate practical skills through
        GitHub-based submissions and transparent technical review.
      </p>

      <div className="features">
        <div className="card">
          <h3>Real Project Evaluation</h3>
          <p>
            Students submit real GitHub projects instead of theoretical
            assignments.
          </p>
        </div>

        <div className="card">
          <h3>Structured Admin Review</h3>
          <p>
            Technical evaluators provide detailed feedback and performance
            scoring.
          </p>
        </div>

        <div className="card">
          <h3>Public Leaderboard</h3>
          <p>
            Transparent ranking system highlights top performers based on
            actual skill.
          </p>
        </div>

        <div className="card">
          <h3>Verified Certification</h3>
          <p>
            Successful participants receive performance-based certification
            for internship validation.
          </p>
        </div>
      </div>

      <div className="footer">
        © 2026 Talent Platform — Empowering Skill-Based Evaluation [ Contact: vtu21984@veltech.edu.in ]
      </div>
    </div>
  );
}