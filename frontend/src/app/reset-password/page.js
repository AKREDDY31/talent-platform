"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleReset = async () => {
    if (!token) {
      setMessage({ type: "error", text: "Reset token is missing" });
      return;
    }

    if (!password || password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/reset-password", { token, password });
      setMessage({ type: "success", text: res.data.message || "Password reset successful" });
      setTimeout(() => router.push("/login"), 1000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-pane" style={{ maxWidth: 540 }}>
        <h1>Reset password</h1>
        <p className="auth-muted">Create a new password for your account.</p>

        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <div className="input-wrap">
          <label>New password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="input-wrap">
          <label>Confirm new password</label>
          <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        <button className="btn primary" onClick={handleReset} disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
      </section>
    </div>
  );
}
