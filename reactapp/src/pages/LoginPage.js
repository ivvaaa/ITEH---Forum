import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../api/hooks/AuthContext";
import "./authPages.css";
import { EyeIcon } from "../components/UIicons";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      nav("/", { replace: true });
    }
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Unesite email i lozinku.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
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
                aria-label={show ? "Sakrij lozinku" : "Prikazi lozinku"}
              >
                <EyeIcon crossed={show} className="auth-toggle-icon" aria-hidden="true" />
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