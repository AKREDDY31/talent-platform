"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const statusOptions = ["SUBMITTED", "OPENED", "SHORTLISTED", "REJECTED"];

export default function AdminPage() {
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [drafts, setDrafts] = useState({});
  const [problemStatement, setProblemStatement] = useState("");
  const [savingStatement, setSavingStatement] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const [summaryRes, projectsRes, statementRes] = await Promise.all([
        API.get("/admin/summary"),
        API.get("/admin/projects"),
        API.get("/platform/problem-statement"),
      ]);

      setSummary(summaryRes.data);
      setProjects(projectsRes.data || []);
      setProblemStatement(statementRes.data?.data?.content || "");

      const initialDrafts = {};
      for (const row of projectsRes.data || []) {
        initialDrafts[row.id] = {
          status: row.status,
          score: row.score ?? "",
          feedback: row.feedback ?? "",
          notifyUser: true,
          message: "",
          subject: `Update on ${row.title}`,
        };
      }
      setDrafts(initialDrafts);
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Failed to load admin data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "ADMIN") {
      router.push("/login?type=admin");
      return;
    }

    bootstrap();
  }, [bootstrap, router]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return projects;
    return projects.filter((p) => {
      return (
        p.title.toLowerCase().includes(term) ||
        p.user.name.toLowerCase().includes(term) ||
        p.user.email.toLowerCase().includes(term)
      );
    });
  }, [projects, search]);

  const setDraft = (projectId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [key]: value,
      },
    }));
  };

  const handleUpdate = async (projectId) => {
    const draft = drafts[projectId];
    if (!draft) return;

    try {
      setSavingId(projectId);
      await API.put(`/admin/projects/${projectId}`, {
        status: draft.status,
        score: draft.score === "" ? null : Number(draft.score),
        feedback: draft.feedback,
        notifyUser: draft.notifyUser,
      });

      setNotice({ type: "success", text: "Project updated successfully" });
      await bootstrap();
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Update failed" });
    } finally {
      setSavingId("");
    }
  };

  const handleNotify = async (projectId) => {
    const draft = drafts[projectId];
    if (!draft || !draft.subject || !draft.message) {
      setNotice({ type: "error", text: "Subject and custom message are required" });
      return;
    }

    try {
      setSavingId(projectId);
      await API.post(`/admin/projects/${projectId}/notify`, {
        subject: draft.subject,
        message: draft.message,
      });
      setNotice({ type: "success", text: "Custom email sent" });
      setDraft(projectId, "message", "");
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Failed to send email" });
    } finally {
      setSavingId("");
    }
  };

  const saveStatement = async (asBlank = false) => {
    try {
      setSavingStatement(true);
      const value = asBlank ? "" : problemStatement;
      await API.put("/platform/problem-statement", { content: value });
      if (asBlank) {
        setProblemStatement("");
      }
      setNotice({ type: "success", text: asBlank ? "Problem statement cleared" : "Problem statement saved" });
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Failed to update problem statement" });
    } finally {
      setSavingStatement(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Review submissions, update evaluation status, publish problem statements, and notify candidates by email.</p>

      {notice.text && <div className={`alert ${notice.type}`}>{notice.text}</div>}

      {summary && (
        <section className="metrics">
          <div className="metric">Registered Users<b>{summary.usersCount}</b></div>
          <div className="metric">Project Submissions<b>{summary.projectsCount}</b></div>
          <div className="metric">Reviewed Projects<b>{summary.reviewedCount}</b></div>
          <div className="metric">Shortlisted<b>{summary.shortlistedCount}</b></div>
        </section>
      )}

      <section className="card" style={{ marginBottom: 16 }}>
        <h3>Problem Statement</h3>
        <p className="auth-muted">This appears to all logged-in users in their dashboard. Keep it updated or clear it when not needed.</p>
        <div className="input-wrap">
          <textarea rows="5" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Enter the active problem statement or instructions for participants" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn primary" onClick={() => saveStatement(false)} disabled={savingStatement}>{savingStatement ? "Saving..." : "Save Statement"}</button>
          <button className="btn danger" onClick={() => saveStatement(true)} disabled={savingStatement}>Make Blank</button>
        </div>
      </section>

      <section className="table-shell">
        <div className="table-top">
          <b>Submission Review Table</b>
          <div className="table-tools">
            <input
              className="input"
              placeholder="Search by project/user/email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 260 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Project</th>
                <th>Current Status</th>
                <th>Evaluation Inputs</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const draft = drafts[project.id] || {};

                return (
                  <tr key={project.id}>
                    <td>
                      <b>{project.user.name}</b>
                      <div>{project.user.email}</div>
                      <div>{project.user.college || "-"}</div>
                    </td>
                    <td>
                      <b>{project.title}</b>
                      <div><a href={project.githubLink} target="_blank" rel="noreferrer">GitHub Link</a></div>
                      <div>Current score: {project.score ?? "Pending"}</div>
                    </td>
                    <td>
                      <div><span className={`badge ${String(project.status).toLowerCase()}`}>{project.status}</span></div>
                      <div>Opened: {project.isOpened ? "Yes" : "No"}</div>
                      <div>Next stage: {project.nextStagePassed === null ? "Pending" : project.nextStagePassed ? "Passed" : "No"}</div>
                    </td>
                    <td>
                      <div className="input-wrap">
                        <label>Status</label>
                        <select value={draft.status || project.status} onChange={(e) => setDraft(project.id, "status", e.target.value)}>
                          {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                      <div className="input-wrap">
                        <label>Score (0-100)</label>
                        <input className="input" value={draft.score ?? ""} onChange={(e) => setDraft(project.id, "score", e.target.value)} />
                      </div>
                      <div className="input-wrap">
                        <label>Feedback</label>
                        <textarea rows="3" value={draft.feedback ?? ""} onChange={(e) => setDraft(project.id, "feedback", e.target.value)} />
                      </div>
                      <div className="input-wrap">
                        <label>
                          <input type="checkbox" checked={draft.notifyUser ?? true} onChange={(e) => setDraft(project.id, "notifyUser", e.target.checked)} />
                          {" "}
                          Send auto status email
                        </label>
                      </div>
                    </td>
                    <td>
                      <button className="btn primary" disabled={savingId === project.id} onClick={() => handleUpdate(project.id)}>
                        {savingId === project.id ? "Saving..." : "Save Review"}
                      </button>

                      <div className="input-wrap" style={{ marginTop: 10 }}>
                        <label>Custom email subject</label>
                        <input className="input" value={draft.subject || ""} onChange={(e) => setDraft(project.id, "subject", e.target.value)} />
                      </div>
                      <div className="input-wrap">
                        <label>Custom message</label>
                        <textarea rows="3" value={draft.message || ""} onChange={(e) => setDraft(project.id, "message", e.target.value)} />
                      </div>
                      <button className="btn secondary" disabled={savingId === project.id} onClick={() => handleNotify(project.id)}>
                        Send Custom Email
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!filtered.length && (
                <tr>
                  <td colSpan={5}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
