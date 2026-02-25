export default function ContactPage() {
  return (
    <div>
      <h1 className="page-title">Contact Support</h1>
      <p className="page-subtitle">Need help with registration, project submission, tracking, certificates, or leaderboard queries.</p>

      <section className="card" style={{ maxWidth: 760 }}>
        <h3>Support Email</h3>
        <p>
          Reach us directly at
          {" "}
          <a href="mailto:ramamohamreddysujatha@gmail.com" style={{ color: "#0a66c2", fontWeight: 700 }}>
            ramamohamreddysujatha@gmail.com
          </a>
        </p>
        <p>Include your registered email and project title in the message for faster resolution.</p>
      </section>
    </div>
  );
}
