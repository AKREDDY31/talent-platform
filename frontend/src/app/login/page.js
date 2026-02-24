"use client";

import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: "120px 20px" }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (type === "admin") {
      setIsAdmin(true);
      setIsRegister(false);
    } else {
      setIsAdmin(false);
    }
  }, [type]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "ADMIN") router.push("/admin");
      else router.push("/dashboard");
    }
  }, []);

  const handleSubmit = async () => {
    setMessage("");

    if (!email || !password || (isRegister && !name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (isRegister && !isAdmin) {
        await API.post("/auth/register", {
          name,
          email,
          password,
        });

        setMessage("Registration successful. Please login.");
        setIsRegister(false);
        return;
      }

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const role = res.data.user.role.toUpperCase();

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      if (role === "ADMIN") router.push("/admin");
      else router.push("/dashboard");

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
          {isAdmin
            ? "Admin Login"
            : isRegister
            ? "Create Account"
            : "User Login"}
        </h2>

        {message && (
          <p style={{ color: message.includes("successful") ? "green" : "red" }}>
            {message}
          </p>
        )}

        {isRegister && !isAdmin && (
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

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        {!isAdmin && (
          <p onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Switch to Login" : "Switch to Register"}
          </p>
        )}
      </div>
    </div>
  );
}
