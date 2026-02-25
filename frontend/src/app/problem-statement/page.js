"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function ProblemStatementPage() {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "USER") {
      router.push("/login");
      return;
    }

    API.get("/platform/problem-statement")
      .then((res) => {
        setStatement(res.data?.data?.content || "");
        setUpdatedAt(res.data?.data?.updatedAt || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to fetch problem statement"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div>
      <h1 className="page-title">Problem Statement</h1>
      <p className="page-subtitle">Click this section anytime to view the latest problem announced by admin.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {statement || "No active problem statement available right now."}
            </p>
            <p style={{ color: "#64748b", marginTop: 16 }}>
              Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Not updated yet"}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
