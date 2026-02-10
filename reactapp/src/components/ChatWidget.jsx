import React, { useMemo, useRef, useState, useEffect } from "react";

// AI Car Avatar SVG Component
const CarAIAvatar = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Car body */}
    <path d="M18 8h-8l-2-2H4v10h16V8z" />
    {/* Front wheel */}
    <circle cx="6" cy="18" r="2" />
    {/* Back wheel */}
    <circle cx="18" cy="18" r="2" />
    {/* Window */}
    <path d="M8 8h8v4H8z" opacity="0.6" />
    {/* AI spark */}
    <path d="M12 2l1 3h3l-2.5 2 1 3-3-2-3 2 1-3L8 5h3l1-3z" fill="currentColor" />
  </svg>
);

export default function ChatWidget({
  // If you set up proxy (recommended), leave apiBaseUrl="" and it will call /api/ai/chat
  apiBaseUrl = "",
  threadId = null,
  isOpen = false,
  onOpenChange = () => {},
}) {
  const [open, setOpen] = useState(isOpen);
  const [mode, setMode] = useState("ask"); // ask | compose_post (summarize later)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content:
        "Ćao! Mogu da pomognem oko pitanja za auto ili da ti sastavim kvalitetan post za forum. (Opšti saveti – za ozbiljne kvarove idi u servis.)",
    },
  ]);

  const scrollerRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync open state with parent
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const endpoint = useMemo(() => {
    // With proxy => "/api/ai/chat"
    // Without proxy => "http://127.0.0.1:8000/api/ai/chat"
    return `${apiBaseUrl}/api/ai/chat`;
  }, [apiBaseUrl]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
      }
    });
  };

  // Auto-expand textarea as user types
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Reset height to auto to get the correct scrollHeight
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Set height based on scrollHeight, but cap at max-height
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    onOpenChange(newOpen);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    scrollToBottom();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 320000); // 5+ minutes

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          message: text,
          threadId: mode === "summarize_thread" ? threadId : null,
          history: next.slice(-10),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      const reply = data?.reply || data?.error || "Nema odgovora.";
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs([
        ...next,
        {
          role: "assistant",
          content:
            "Ne mogu da dođem do AI servisa. Proveri da li radi Laravel server i da li je API adresa ispravna.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // --- STYLES (inline, so it won’t conflict with your CSS) ---
  const styles = {
    fab: {
      position: "fixed",
      right: 22,
      bottom: 22,
      zIndex: 9999,
      border: "2px solid rgba(255,31,61,0.4)",
      background: "linear-gradient(135deg, rgba(255,31,61,0.15) 0%, rgba(255,31,61,0.05) 100%)",
      color: "#ff1f3d",
      padding: "12px 16px",
      borderRadius: 50,
      cursor: "pointer",
      boxShadow: "0 8px 24px rgba(255,31,61,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    fabHover: {
      transform: "scale(1.08)",
      boxShadow: "0 12px 32px rgba(255,31,61,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
      background: "linear-gradient(135deg, rgba(255,31,61,0.25) 0%, rgba(255,31,61,0.08) 100%)",
    },
    panel: {
      position: "fixed",
      right: 22,
      bottom: 22,
      width: 380,
      height: 560,
      zIndex: 9999,
      borderRadius: 18,
      overflow: "hidden",
      background: "rgba(16,16,18,0.96)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 16px 60px rgba(0,0,0,0.55)",
      backdropFilter: "blur(14px)",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      padding: "12px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brand: { display: "flex", alignItems: "center", gap: 10 },
    title: { fontWeight: 800, letterSpacing: 0.5 },
    subtitle: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
    closeBtn: {
      background: "transparent",
      color: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 10,
      width: 34,
      height: 34,
      cursor: "pointer",
    },
    controls: {
      padding: 12,
      display: "flex",
      gap: 10,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      alignItems: "center",
    },
    select: {
      background: "rgba(255,255,255,0.1)", // Darker background on focus
      color: "white",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 12,
      padding: "10px 12px",
      outline: "none",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.3s", // Smooth transition for background change
    },
    hint: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
    body: {
      flex: 1,
      overflowY: "auto",
      padding: 12,
    },
    row: (isUser) => ({
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }),
    bubble: (isUser) => ({
      maxWidth: "88%",
      padding: "10px 12px",
      borderRadius: 14,
      whiteSpace: "pre-wrap",
      lineHeight: 1.35,
      background: isUser ? "rgba(255,31,61,0.18)" : "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.10)",
    }),
    footer: {
      padding: 12,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      gap: 10,
      alignItems: "flex-end",
    },
    textarea: {
      flex: 1,
      background: "rgba(255,255,255,0.06)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 14,
      padding: "12px 12px",
      outline: "none",
      fontFamily: "inherit",
      fontSize: "14px",
      resize: "none",
      maxHeight: "120px",
      minHeight: "44px",
      overflowY: "auto",
    },
    send: {
      background: "#ff1f3d",
      color: "white",
      border: "none",
      padding: "12px 14px",
      borderRadius: 14,
      cursor: "pointer",
      fontWeight: 700,
      minWidth: "60px",
    },
    disclaimer: {
      padding: "0 12px 12px",
      fontSize: 11,
      color: "rgba(255,255,255,0.55)",
    },
    option: {
      background: "rgba(16,16,18,0.96)",
      color: "white",
      padding: "8px 12px",
    },
  };

  const [fabHovered, setFabHovered] = useState(false);

  if (!open) {
    return (
      <button
        style={{
          ...styles.fab,
          ...(fabHovered ? styles.fabHover : {}),
        }}
        onClick={() => handleOpenChange(true)}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        aria-label="Open AI Chat"
        title="Chat sa AI asistentom"
      >
        <CarAIAvatar size={24} />
        <span>AI Asistent</span>
      </button>
    );
  }

  return (
    <div style={styles.panel} role="dialog" aria-label="Vas pametni auto asistent">
      <div style={styles.header}>
        <div style={styles.brand}>
          <CarAIAvatar size={24} />
          <div>
            <div style={styles.title}>AI asistent</div>
            <div style={styles.subtitle}>Vaš pomoćnik</div>
          </div>
        </div>
        <button 
          style={styles.closeBtn} 
          onClick={() => handleOpenChange(false)} 
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={styles.controls}>
        <select
          style={styles.select}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="ask" style={styles.option}>Pitaj</option>
          <option value="compose_post" style={styles.option}>Napravi post</option>
        </select>
        <div style={styles.hint}>
          {mode === "compose_post" ? "Sastavi dobar dijagnostički post" : "Opšta pitanja i saveti"}
        </div>
      </div>

      <div style={styles.body} ref={scrollerRef}>
        {msgs.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} style={styles.row(isUser)}>
              <div style={styles.bubble(isUser)}>{m.content}</div>
            </div>
          );
        })}
        {loading && (
          <div style={styles.row(false)}>
            <div style={styles.bubble(false)}>Razmišljam…</div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Npr. 'Koji auto je najepši auto 2025. godine?'"
        />
        <button style={styles.send} onClick={send} disabled={loading}>
          Pošalji
        </button>
      </div>

      <div style={styles.disclaimer}>
        Opšti saveti. Za bezbednosno kritične probleme (kočnice, upravljanje, curenje goriva) – servis/mehaničar.
      </div>
    </div>
  );
}
