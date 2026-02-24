"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState(null);

  // Sync role on route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token && storedRole) {
      setRole(storedRole.toUpperCase());
    } else {
      setRole(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setRole(null);

    router.push("/");
    router.refresh();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">Talent Platform</Link>
      </div>

      <div className="nav-actions">
        {/* ADMIN VIEW */}
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

        {/* USER VIEW */}
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

        {/* NOT LOGGED IN */}
        {!role && (
          <>
            <Link href="/login">
              <button className="btn primary">Login / Register</button>
            </Link>

            <Link href="/admin">
              <button className="btn secondary">Admin Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
