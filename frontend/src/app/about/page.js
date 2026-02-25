export default function AboutPage() {
  return (
    <div>
      <h1 className="page-title">About Talent Platform</h1>
      <p className="page-subtitle">A practical evaluation platform designed to identify real technical capability through project-based assessment.</p>

      <section className="grid-3">
        <article className="card">
          <h3>How It Works</h3>
          <p>
            Users upload real GitHub projects. Admin reviewers evaluate each submission, assign score, provide feedback,
            and update the project status for interview progression tracking.
          </p>
        </article>
        <article className="card">
          <h3>Why It Helps</h3>
          <p>
            Candidates receive structured technical feedback, improve their portfolios, and build credibility through
            transparent ranking and documented review outcomes.
          </p>
        </article>
        <article className="card">
          <h3>Rewards</h3>
          <p>
            Top performers can get cash prizes, rewards, and verified certificates. Exceptional candidates are
            shortlisted for next technical interview stages.
          </p>
        </article>
      </section>
    </div>
  );
}
