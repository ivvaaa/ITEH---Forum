import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import "./authPages.css";

export default function Login({ setIsLoggedIn }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("auth_token") || localStorage.getItem("access_token")) {
      setIsLoggedIn?.(true);
      nav("/", { replace: true });
    }
  }, [nav, setIsLoggedIn]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Unesite email i lozinku.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/login", { email, password });
      if (!data?.access_token) throw new Error("Nema tokena.");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user || null));
      sessionStorage.setItem("auth_token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user || null));
      if (data.user?.role_id) sessionStorage.setItem("role_id", String(data.user.role_id));

      setIsLoggedIn?.(true);
      const to = loc.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch (err) {
      setError("Pogresan email ili lozinka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Prijava</h1>
        <p className="auth-subtitle">Dobrodosli nazad! Ulogujte se i nastavite razgovor sa zajednicom.</p>

        <form onSubmit={submit} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="primer@domen.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Lozinka</span>
            <div className="auth-input-group">
              <input
                className="auth-input"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite lozinku"
                required
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShow((value) => !value)}
              >
                {show ? "Sakrij" : "Prikazi"}
              </button>
            </div>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Prijava..." : "Uloguj se"}
          </button>
        </form>

        <p className="auth-footer">
          Nemate nalog? <Link to="/register" className="auth-link">Registrujte se</Link>
        </p>
      </div>
    </div>
  );
}


