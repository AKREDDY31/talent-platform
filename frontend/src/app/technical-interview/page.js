"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function TechnicalInterviewPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingPresentationId, setSavingPresentationId] = useState("");

  const fetchData = () => {
    API.get("/projects/tracking")
      .then((res) => setProjects(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load technical interview data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "USER") {
      router.push("/login");
      return;
    }

    fetchData();
  }, [router]);

  const savePresentationLink = async (projectId, presentationLink) => {
    try {
      setSavingPresentationId(projectId);
      await API.patch(`/projects/${projectId}/presentation`, { presentationLink });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save PPT link");
    } finally {
      setSavingPresentationId("");
    }
  };

  return (
    <div>
      <h1 className="page-title">Technical Interview Preparation</h1>
      <p className="page-subtitle">Shortlisted projects are eligible for technical interview. Upload your PPT/Drive link per project.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="table-shell">
        <div className="table-top">
          <b>Project-wise Technical Preparation</b>
          <span style={{ color: "#5f6f82" }}>Shortlisted projects only</span>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Eligibility</th>
                <th>PPT / Drive Link</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const editable = project.technicalInterviewEligible;
                return (
                  <tr key={project.id}>
                    <td>{project.title}</td>
                    <td>{editable ? "Eligible for technical interview" : "Not eligible"}</td>
                    <td>
                      <input
                        className="input"
                        defaultValue={project.presentationLink || ""}
                        placeholder="Paste PPT or drive link"
                        id={`ppt-${project.id}`}
                        disabled={!editable}
                      />
                    </td>
                    <td>
                      <button
                        className="btn primary"
                        disabled={!editable || savingPresentationId === project.id}
                        onClick={() => {
                          const value = document.getElementById(`ppt-${project.id}`)?.value || "";
                          savePresentationLink(project.id, value);
                        }}
                      >
                        {savingPresentationId === project.id ? "Saving..." : "Save PPT Link"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!projects.length && (
                <tr>
                  <td colSpan={4}>No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
