"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState(null);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (token && userRole) {
      setRole(userRole);
    } else {
      setRole(null);
    }
  }, [pathname]); // re-check on route change

  const handleLogout = () => {
    // Clear everything
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setRole(null);

    // Force refresh UI
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">Talent Platform</Link>
      </div>

      <div className="nav-actions">
        {role === "ADMIN" && (
          <>
            <Link href="/admin">
              <button className="btn secondary">Admin Panel</button>
            </Link>

            <Link href="/leaderboard">
              <button className="btn secondary">Leaderboard</button>
            </Link>

            <button onClick={handleLogout} className="btn danger">
              Logout
            </button>
          </>
        )}

        {role === "USER" && (
          <>
            <Link href="/dashboard">
              <button className="btn secondary">Dashboard</button>
            </Link>

            <Link href="/leaderboard">
              <button className="btn secondary">Leaderboard</button>
            </Link>

            <button onClick={handleLogout} className="btn danger">
              Logout
            </button>
          </>
        )}

        {!role && (
          <>
            <Link href="/login">
              <button className="btn primary">Login / Register</button>
            </Link>

            <Link href="/login?type=admin">
              <button className="btn secondary">Admin Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}