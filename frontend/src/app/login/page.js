"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get("type");

  const isAdminLogin = type === "admin";

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setMessage("");

    if (!email || !password || (isRegister && !name)) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      // REGISTER (only for users)
      if (isRegister && !isAdminLogin) {
        await API.post("/auth/register", { name, email, password });
        setMessage("Registration successful. Please login.");
        setIsRegister(false);
        return;
      }

      // LOGIN
      const res = await API.post("/auth/login", { email, password });

      const role = res.data.user.role;

      // Role protection
      if (isAdminLogin && role !== "ADMIN") {
        setMessage("You are not an admin.");
        return;
      }

      if (!isAdminLogin && role === "ADMIN") {
        setMessage("Use Admin Login.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(res.data.user)); // ADD THIS

      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>
          {isAdminLogin
            ? "Admin Login"
            : isRegister
            ? "Create Account"
            : "User Login"}
        </h2>

        {message && <p className="auth-message">{message}</p>}

        {isRegister && !isAdminLogin && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

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

        <button
          onClick={handleSubmit}
          className="btn primary full"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isRegister
            ? "Register"
            : "Login"}
        </button>

        {!isAdminLogin && (
          <p className="auth-toggle">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
            <span onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? " Login" : " Register"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}