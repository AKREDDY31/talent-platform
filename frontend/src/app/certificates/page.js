"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function CertificatesPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState("");
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
      .catch((err) => setError(err.response?.data?.message || "Failed to load certificates"))
      .finally(() => setLoading(false));
  }, [router]);

  const rows = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      certificateEligible: project.score !== null && project.score >= 50,
      certificateStatus: project.score === null ? "Pending Evaluation" : project.score >= 50 ? "Eligible" : "Not Eligible (<50)",
    }));
  }, [projects]);

  const downloadCertificate = async (projectId, title) => {
    try {
      setDownloadingId(projectId);
      const response = await API.get(`/projects/certificate/${projectId}`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download certificate");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <div>
      <h1 className="page-title">My Certificates</h1>
      <p className="page-subtitle">Certificate eligibility is based on admin evaluation score: 50 and above.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="table-shell">
        <div className="table-top">
          <b>Project Certificate Status</b>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Score</th>
                <th>Certificate Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.status}</td>
                  <td>{project.score ?? "Pending"}</td>
                  <td>{project.certificateStatus}</td>
                  <td>
                    {project.certificateEligible ? (
                      <button className="btn primary" onClick={() => downloadCertificate(project.id, project.title)} disabled={downloadingId === project.id}>
                        {downloadingId === project.id ? "Downloading..." : "Download Certificate"}
                      </button>
                    ) : (
                      "Not available"
                    )}
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={5}>No projects submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
