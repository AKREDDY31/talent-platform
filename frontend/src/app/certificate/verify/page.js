"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import API from "@/lib/api";

export default function CertificateVerifyPage() {
  const params = useSearchParams();
  const projectId = params.get("projectId") || "";
  const certificateNumber = params.get("certificateNumber") || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasInvalidParams = !projectId || !certificateNumber;

  useEffect(() => {
    if (hasInvalidParams) {
      return;
    }

    API.get(`/projects/public/certificate/verify?projectId=${encodeURIComponent(projectId)}&certificateNumber=${encodeURIComponent(certificateNumber)}`)
      .then((res) => setData(res.data?.data || null))
      .catch((err) => setError(err.response?.data?.message || "Certificate verification failed"))
      .finally(() => setLoading(false));
  }, [projectId, certificateNumber, hasInvalidParams]);

  const downloadPublicCertificate = async () => {
    try {
      const response = await API.get(`/projects/public/certificate/${projectId}/download?certificateNumber=${encodeURIComponent(certificateNumber)}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificateNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to download certificate");
    }
  };

  return (
    <div>
      <h1 className="page-title">Certificate Verification</h1>
      <p className="page-subtitle">Scan-verified certificate details.</p>

      {hasInvalidParams && <div className="alert error">Invalid verification link.</div>}
      {!hasInvalidParams && loading && <div className="card">Verifying certificate...</div>}
      {error && <div className="alert error">{error}</div>}

      {!loading && data && (
        <section className="table-shell">
          <div className="table-top">
            <b>Verified Certificate Details</b>
          </div>
          <table>
            <tbody>
              <tr><th>Certificate Number</th><td>{data.certificateNumber}</td></tr>
              <tr><th>Candidate Name</th><td>{data.candidateName}</td></tr>
              <tr><th>Candidate Email</th><td>{data.candidateEmail}</td></tr>
              <tr><th>Project Title</th><td>{data.projectTitle}</td></tr>
              <tr><th>Project Link</th><td><a href={data.projectLink} target="_blank" rel="noreferrer">{data.projectLink}</a></td></tr>
              <tr><th>Score</th><td>{data.score}</td></tr>
              <tr><th>Issued On</th><td>{new Date(data.issuedAt).toLocaleString()}</td></tr>
            </tbody>
          </table>
          <div style={{ padding: 16 }}>
            <button className="btn primary" onClick={downloadPublicCertificate}>Download Exact Certificate PDF</button>
          </div>
        </section>
      )}
    </div>
  );
}
