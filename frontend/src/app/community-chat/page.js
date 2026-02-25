"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function CommunityChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      const res = await API.get("/platform/chat/messages");
      setMessages(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "USER") {
      router.push("/login");
      return;
    }

    loadMessages();
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      setSending(true);
      await API.post("/platform/chat/messages", { message: input });
      setInput("");
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Community Chat</h1>
      <p className="page-subtitle">All logged-in users can communicate in this section.</p>
      {error && <div className="alert error">{error}</div>}

      <section className="table-shell">
        <div className="table-top">
          <b>Notifications / Community Chat</b>
        </div>

        <div style={{ padding: 16, maxHeight: 420, overflowY: "auto", borderBottom: "1px solid #e1e9f3" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: 12 }}>
                  <b>{msg.user?.name}</b>{" "}
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    ({msg.user?.role}) • {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "time unavailable"}
                  </span>
                  <div>{msg.message}</div>
                </div>
              ))}
              {!messages.length && <div>No messages yet.</div>}
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, padding: 12 }}>
          <input className="input" placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn primary" onClick={sendMessage} disabled={sending}>{sending ? "Sending..." : "Send"}</button>
        </div>
      </section>
    </div>
  );
}
