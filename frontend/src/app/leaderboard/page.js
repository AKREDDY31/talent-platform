"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const metricLabel = {
  totalScore: "Total Score",
  averageScore: "Average Score",
  projectCount: "Projects Reviewed",
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("totalScore");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rowsPerPage = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    API.get("/leaderboard")
      .then((res) => setRows(res.data || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const copied = [...rows].filter((entry) => {
      if (!term) return true;
      return entry.name.toLowerCase().includes(term) || entry.email.toLowerCase().includes(term);
    });

    copied.sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      if (left === right) return 0;
      return order === "asc" ? left - right : right - left;
    });

    return copied;
  }, [rows, search, sortBy, order]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div>
      <h1 className="page-title">Public Leaderboard</h1>
      <p className="page-subtitle">Visible after login to keep participant data private and role-aware.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="table-shell">
        <div className="table-top">
          <b>Leaderboard Table</b>
          <div className="table-tools">
            <input className="input" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="totalScore">Total Score</option>
              <option value="averageScore">Average Score</option>
              <option value="projectCount">Project Count</option>
            </select>
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate</th>
                  <th>Total Score</th>
                  <th>Average Score</th>
                  <th>Projects</th>
                  <th>Primary Metric</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => (
                  <tr key={row.id}>
                    <td>#{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td>
                      <b>{row.name}</b>
                      <div>{row.email}</div>
                    </td>
                    <td>{row.totalScore}</td>
                    <td>{row.averageScore}</td>
                    <td>{row.projectCount}</td>
                    <td>{metricLabel[sortBy]}: <b>{row[sortBy]}</b></td>
                  </tr>
                ))}
                {!pageRows.length && (
                  <tr>
                    <td colSpan={6}>No leaderboard records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="table-top" style={{ borderTop: "1px solid #e1e9f3", borderBottom: 0 }}>
              <span>Page {currentPage} of {totalPages}</span>
              <div className="table-tools">
                <button className="btn secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>Previous</button>
                <button className="btn secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
