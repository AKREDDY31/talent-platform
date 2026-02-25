"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const badgeClass = {
  SUBMITTED: "submitted",
  OPENED: "opened",
  SHORTLISTED: "shortlisted",
  REJECTED: "rejected",
};

export default function ProjectTrackingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "USER") {
      router.push("/login");
      return;
    }

    API.get("/projects/tracking")
      .then((res) => setProjects(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load project tracking"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div>
      <h1 className="page-title">Project Tracking</h1>
      <p className="page-subtitle">All project status and certificate eligibility updates are visible here.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="table-shell">
        <div className="table-top">
          <b>Tracking Table</b>
          <span style={{ color: "#5f6f82" }}>Live admin updates</span>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Next Stage</th>
                <th>Score</th>
                <th>Feedback</th>
                <th>Certificate Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <b>{project.title}</b>
                    <div>
                      <a href={project.githubLink} target="_blank" rel="noreferrer">Repository</a>
                    </div>
                  </td>
                  <td><span className={`badge ${badgeClass[project.status]}`}>{project.status}</span></td>
                  <td>{project.isOpened ? "Yes" : "No"}</td>
                  <td>{project.nextStagePassed === null ? "Pending" : project.nextStagePassed ? "Passed" : "Not moved"}</td>
                  <td>{project.score ?? "Pending"}</td>
                  <td>{project.feedback || "-"}</td>
                  <td>{project.certificateEligible ? "Eligible (50+)" : "Not Eligible"}</td>
                </tr>
              ))}
              {!projects.length && (
                <tr>
                  <td colSpan={7}>No project submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
