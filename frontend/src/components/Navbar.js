"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  usePathname();

  let user = null;
  let token = null;
  if (typeof window !== "undefined") {
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
      token = localStorage.getItem("token");
    } catch {
      user = null;
      token = null;
    }
  }

  const role = token ? user?.role : null;

  const links = useMemo(() => {
    if (role === "ADMIN") {
      return [
        { href: "/admin", label: "Admin Dashboard" },
        { href: "/leaderboard", label: "Leaderboard" },
      ];
    }

    if (role === "USER") {
      return [
        { href: "/project-tracking", label: "Project Tracking" },
        { href: "/problem-statement", label: "Problem Statement" },
        { href: "/technical-interview", label: "Technical Interview" },
        { href: "/community-chat", label: "Community Chat" },
        { href: "/certificates", label: "Certificates" },
        { href: "/leaderboard", label: "Public Leaderboard" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];
    }

    return [];
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        <span className="brand-title">Talent Platform</span>
        <span className="brand-sub">Project Evaluation, Tracking, Rewards</span>
      </Link>

      <div className="nav-actions">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <button className="btn secondary">{item.label}</button>
          </Link>
        ))}

        {!role && (
          <>
            <Link href="/login">
              <button className="btn primary">User Login / Register</button>
            </Link>
            <Link href="/login?type=admin">
              <button className="btn ghost">Admin Login</button>
            </Link>
          </>
        )}

        {role && (
          <button className="btn danger" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
