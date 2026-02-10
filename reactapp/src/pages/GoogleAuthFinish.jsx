import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../api/hooks/AuthContext";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

export default function GoogleAuthFinish() {
  const { setAuthFromToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying Google login...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      setStatus("error");
      setMessage("Nedostaje kod za prijavu.");
      return;
    }

    const run = async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/auth/exchange`, { code });
        const { access_token, token, user } = res.data || {};
        const effectiveToken = access_token || token;
        if (!effectiveToken || !user) {
          throw new Error("Nedostaje token ili korisnik.");
        }
        setAuthFromToken(effectiveToken, user);
        setStatus("success");
        setMessage("Uspešna prijava. Preusmeravanje...");
        setTimeout(() => navigate("/", { replace: true }), 600);
      } catch (err) {
        console.error("Google auth exchange failed", err);
        setStatus("error");
        setMessage("Prijava preko Google-a nije uspela.");
      }
    };

    run();
  }, [location.search, navigate, setAuthFromToken]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Google prijava</h1>
        <p className={`auth-subtitle ${status === "error" ? "auth-error" : ""}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
