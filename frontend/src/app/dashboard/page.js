"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const initialProject = {
  title: "",
  githubLink: "",
  demoLink: "",
  techStack: "",
  description: "",
};

export default function DashboardPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialProject);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const reviewedCount = useMemo(() => projects.filter((p) => p.score !== null).length, [projects]);

  const fetchSummary = useCallback(async () => {
    try {
      const trackingRes = await API.get("/projects/tracking");
      setProjects(trackingRes.data.data || []);
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Failed to load dashboard data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "USER") {
      router.push("/login");
      return;
    }

    fetchSummary();
  }, [fetchSummary, router]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submitProject = async () => {
    if (!form.title || !form.githubLink) {
      setNotice({ type: "error", text: "Project title and GitHub link are required" });
      return;
    }

    try {
      setSubmitting(true);
      setNotice({ type: "", text: "" });
      await API.post("/projects", form);
      setForm(initialProject);
      setNotice({ type: "success", text: "Project submitted successfully" });
      fetchSummary();
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">User Dashboard</h1>
      <p className="page-subtitle">Submit new projects from this dashboard. Tracking and other modules are available in their dedicated sections.</p>

      {notice.text && <div className={`alert ${notice.type}`}>{notice.text}</div>}

      <section className="metrics">
        <div className="metric">Total Submissions<b>{loading ? "..." : projects.length}</b></div>
        <div className="metric">Reviewed<b>{loading ? "..." : reviewedCount}</b></div>
        <div className="metric">Shortlisted<b>{loading ? "..." : projects.filter((p) => p.status === "SHORTLISTED").length}</b></div>
        <div className="metric">Rejected<b>{loading ? "..." : projects.filter((p) => p.status === "REJECTED").length}</b></div>
      </section>

      <section className="card" style={{ maxWidth: 760 }}>
        <h3>Upload New Project</h3>
        <div className="input-wrap">
          <label>Project title*</label>
          <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div className="input-wrap">
          <label>GitHub repository link*</label>
          <input className="input" value={form.githubLink} onChange={(e) => setField("githubLink", e.target.value)} />
        </div>
        <div className="input-wrap">
          <label>Demo link</label>
          <input className="input" value={form.demoLink} onChange={(e) => setField("demoLink", e.target.value)} />
        </div>
        <div className="input-wrap">
          <label>Tech stack</label>
          <input className="input" value={form.techStack} onChange={(e) => setField("techStack", e.target.value)} />
        </div>
        <div className="input-wrap">
          <label>Description</label>
          <textarea rows="4" value={form.description} onChange={(e) => setField("description", e.target.value)} />
        </div>

        <button className="btn primary" onClick={submitProject} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Project"}
        </button>
      </section>
    </div>
  );
}
