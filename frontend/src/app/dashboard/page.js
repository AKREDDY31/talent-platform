"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Protect Route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects/mine");
      setProjects(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const submitProject = async () => {
    if (!title || !githubLink) return;

    try {
      setLoading(true);
      await API.post("/projects", { title, githubLink });
      setTitle("");
      setGithubLink("");
      fetchProjects();
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="section-title">My Projects</h1>

      <div className="form-inline">
        <input
          className="input"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="input"
          placeholder="GitHub Link"
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
        />

        <button
          onClick={submitProject}
          className="btn primary"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>

      {projects.length === 0 && (
        <p style={{ color: "#6b7280" }}>
          No projects submitted yet.
        </p>
      )}

      {projects.map((p) => (
        <div key={p.id} className="project-card">
          <h3>{p.title}</h3>

          <div className="project-meta">
            Score: {p.score ?? "Not Reviewed"}
          </div>

          <div className="project-meta">
            Feedback: {p.feedback ?? "-"}
          </div>

          {p.score !== null && (
            <button
              className="btn secondary"
              onClick={() =>
                window.open(
                  `http://localhost:5000/api/projects/certificate/${p.id}`,
                  "_blank"
                )
              }
            >
              Download Certificate
            </button>
          )}
        </div>
      ))}
    </div>
  );
}