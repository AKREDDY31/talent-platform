"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function AdminPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/admin/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleReview = async (id, score, feedback) => {
    if (!score) return alert("Score required");

    try {
      await API.put(`/admin/projects/${id}`, {
        score: Number(score),
        feedback,
      });

      fetchProjects(); // refresh leaderboard automatically
    } catch {
      alert("Review failed");
    }
  };

  if (loading) return <p className="center">Loading...</p>;

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>User</th>
              <th>Score</th>
              <th>Feedback</th>
              <th>New Score</th>
              <th>New Feedback</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.user.name}</td>
                <td>{p.score ?? "-"}</td>
                <td>{p.feedback ?? "-"}</td>

                <td>
                  <input type="number" id={`score-${p.id}`} />
                </td>

                <td>
                  <input type="text" id={`feedback-${p.id}`} />
                </td>

                <td>
                  <button
                    className="btn primary"
                    onClick={() =>
                      handleReview(
                        p.id,
                        document.getElementById(`score-${p.id}`).value,
                        document.getElementById(`feedback-${p.id}`).value
                      )
                    }
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}