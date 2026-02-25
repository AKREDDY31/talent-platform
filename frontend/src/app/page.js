import Link from "next/link";

export default function Home() {
  return (
    <div className="hero">
      <section className="hero-banner">
        <h1>Build, Submit, Track, and Get Rewarded</h1>
        <p>
          Talent Platform evaluates real projects, not theory. Submit your GitHub work, receive structured technical
          feedback, track your interview-stage progress, and compete with measurable outcomes.
        </p>

        <div className="hero-cta">
          <Link href="/login">
            <button className="btn primary">Start as Candidate</button>
          </Link>
          <Link href="/login?type=admin">
            <button className="btn secondary">Admin Access</button>
          </Link>
        </div>
      </section>

      <h2 className="section-head">Why Candidates Prefer This Platform</h2>
      <section className="grid-3">
        <article className="card">
          <h3>Transparent Review</h3>
          <p>Every project is scored with admin feedback and visible status tracking from submission to decision.</p>
        </article>
        <article className="card">
          <h3>Career Advantages</h3>
          <p>Strong performers are shortlisted for next technical interview stages based on real work quality.</p>
        </article>
        <article className="card">
          <h3>Rewards and Recognition</h3>
          <p>Top performers can receive cash prizes, rewards, and verified completion certificates.</p>
        </article>
      </section>

      <p className="footer">2026 Talent Platform. Practical project evaluation with measurable outcomes.</p>
    </div>
  );
}
