"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  useEffect(() => {
    fetchLeaderboard();

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUserId(user.id);
    }

    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get("/leaderboard");
      setData(res.data);
    } catch (err) {
      console.log("Failed to load leaderboard");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const start = (page - 1) * rowsPerPage;
  const paginatedData = data.slice(start, start + rowsPerPage);

  return (
    <div style={{ padding: "40px 80px" }}>
      <h1 style={{ marginBottom: "30px" }}>🏆 Public Leaderboard</h1>

      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Total Score</th>
              <th>Projects</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user, index) => {
              const globalRank = start + index + 1;
              const isCurrentUser = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  style={
                    isCurrentUser
                      ? { backgroundColor: "#e6f0ff", fontWeight: "bold" }
                      : {}
                  }
                >
                  <td>#{globalRank}</td>
                  <td>{user.name}</td>
                  <td style={{ color: "#2563eb", fontWeight: "600" }}>
                    {user.totalScore}
                  </td>
                  <td>{user.projectCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
};