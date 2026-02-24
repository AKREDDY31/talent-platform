"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const role = res.data.user.role.toUpperCase();

      if (role !== "ADMIN") {
        setMessage("You are not an admin.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      router.push("/admin");

    } catch (err) {
      setMessage("Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>

        {message && <p style={{ color: "red" }}>{message}</p>}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit}>
          Login
        </button>
      </div>
    </div>
  );
}
