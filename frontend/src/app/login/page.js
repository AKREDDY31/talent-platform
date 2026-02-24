"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function Login() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setMessage("");

    if (!email || !password || (isRegister && !name)) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
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
        <h2>{isRegister ? "Create Account" : "User Login"}</h2>

        {message && (
          <p style={{ color: message.includes("successful") ? "green" : "red" }}>
            {message}
          </p>
        )}

        {isRegister && (
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

        <p onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Switch to Login" : "Switch to Register"}
        </p>
      </div>
    </div>
  );
}
