"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/lib/api";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  college: "",
  graduationYear: "",
  skills: "",
  bio: "",
  adminInviteCode: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const isAdminLogin = params.get("type") === "admin";

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultForm);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const viewTitle = useMemo(() => {
    if (mode === "forgot") return "Forgot password";
    if (mode === "register") return isAdminLogin ? "Admin registration" : "Create user account";
    return isAdminLogin ? "Admin login" : "User login";
  }, [mode, isAdminLogin]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setInfo = (type, text) => setMessage({ type, text });

  const validateRegister = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return "Please fill all required fields";
    }

    if (!emailPattern.test(form.email)) {
      return "Please enter a valid email";
    }

    if (form.password !== form.confirmPassword) {
      return "Password confirmation does not match";
    }

    if (!strongPasswordPattern.test(form.password)) {
      return "Password must include uppercase, lowercase, number, special character, and be 8+ characters";
    }

    if (isAdminLogin && !form.adminInviteCode) {
      return "Admin invite code is required";
    }

    return "";
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setInfo("error", "Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setInfo("", "");
      const res = await API.post("/auth/login", { email: form.email, password: form.password });

      const userRole = res.data.user.role;
      if (isAdminLogin && userRole !== "ADMIN") {
        setInfo("error", "Use user login for this account");
        return;
      }

      if (!isAdminLogin && userRole === "ADMIN") {
        setInfo("error", "Use admin login for this account");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      router.push(userRole === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error) {
      setInfo("error", error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errorMessage = validateRegister();
    if (errorMessage) {
      setInfo("error", errorMessage);
      return;
    }

    try {
      setLoading(true);
      setInfo("", "");

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: isAdminLogin ? "ADMIN" : "USER",
        phone: form.phone,
        college: form.college,
        graduationYear: form.graduationYear || null,
        skills: form.skills,
        bio: form.bio,
        adminInviteCode: form.adminInviteCode,
      };

      await API.post("/auth/register", payload);

      setInfo("success", "Registration successful. Please login with your credentials.");
      setMode("login");
      setForm(defaultForm);
    } catch (error) {
      setInfo("error", error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!emailPattern.test(forgotEmail)) {
      setInfo("error", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setInfo("", "");
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      setInfo("success", res.data.message || "If the email exists, a reset link has been sent");
    } catch (error) {
      setInfo("error", error.response?.data?.message || "Failed to request reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-shell ${isAdminLogin ? "single" : ""}`}>
      <section className="auth-pane">
        <h1>{viewTitle}</h1>
        <p className="auth-muted">
          {isAdminLogin
            ? "Admin authentication for project review operations."
            : "Access your account, track project status, and download certificates after evaluation."}
        </p>

        <div className="tabs">
          <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Login</button>
          <button className={`tab-btn ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Register</button>
          {!isAdminLogin && (
            <button className={`tab-btn ${mode === "forgot" ? "active" : ""}`} onClick={() => setMode("forgot")}>Forgot Password</button>
          )}
        </div>

        {message.text && <div className={`alert ${message.type || "success"}`}>{message.text}</div>}

        {mode === "login" && (
          <>
            <div className="input-wrap">
              <label>Email</label>
              <input className="input" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="input-wrap">
              <label>Password</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setField("password", e.target.value)} />
            </div>
            <button className="btn primary" onClick={handleLogin} disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
          </>
        )}

        {mode === "register" && (
          <>
            <div className="form-grid">
              <div className="input-wrap">
                <label>Full name*</label>
                <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>Email*</label>
                <input className="input" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>Password*</label>
                <input type="password" className="input" value={form.password} onChange={(e) => setField("password", e.target.value)} />
                <small className="auth-muted">Use 8+ characters with uppercase, lowercase, number, and special character.</small>
              </div>
              <div className="input-wrap">
                <label>Confirm password*</label>
                <input type="password" className="input" value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>Phone</label>
                <input className="input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>College</label>
                <input className="input" value={form.college} onChange={(e) => setField("college", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>Graduation year</label>
                <input className="input" value={form.graduationYear} onChange={(e) => setField("graduationYear", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label>Skills</label>
                <input className="input" value={form.skills} onChange={(e) => setField("skills", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
              </div>
            </div>

            <div className="input-wrap">
              <label>Bio</label>
              <textarea rows="3" value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
            </div>

            {isAdminLogin && (
              <div className="input-wrap">
                <label>Admin invite code*</label>
                <input className="input" value={form.adminInviteCode} onChange={(e) => setField("adminInviteCode", e.target.value)} />
              </div>
            )}

            <button className="btn primary" onClick={handleRegister} disabled={loading}>{loading ? "Submitting..." : "Register"}</button>
          </>
        )}

        {mode === "forgot" && !isAdminLogin && (
          <>
            <div className="input-wrap">
              <label>Registered email</label>
              <input className="input" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            </div>
            <button className="btn primary" onClick={handleForgot} disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
          </>
        )}
      </section>

      {!isAdminLogin && (
        <section className="auth-pane">
          <h1>Why This Platform</h1>
          <p className="auth-muted">
            Submit real work, get structured technical review, and track every project outcome transparently.
          </p>

          <div className="card">
            <h3>Rewards and Benefits</h3>
            <p>
              Top performers can receive cash prizes, rewards, and verified certificates. Your profile gets stronger with
              real project assessments and visible ranking.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
