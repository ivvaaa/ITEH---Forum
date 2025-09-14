import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login({ setIsLoggedIn }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("auth_token") || localStorage.getItem("token")) {
      setIsLoggedIn?.(true);
      nav("/", { replace: true });
    }
  }, [nav, setIsLoggedIn]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Unesite email i lozinku.");
    setLoading(true);
    try {
      const { data } = await api.post("/api/login", { email, password });
      if (!data?.token) throw new Error("Nema tokena.");

      // čuvaj u OBA storage-a (da radi i axios i tvoj App)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || null));
      sessionStorage.setItem("auth_token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user || null));
      if (data.user?.role_id) sessionStorage.setItem("role_id", String(data.user.role_id));

      setIsLoggedIn?.(true);
      const to = loc.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch (err) {
      setError("Pogrešan email ili lozinka.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto" }}>
      <h1>Prijava</h1>
      <form onSubmit={submit}>
        <label className="input-container">
          <span className="input-label">Email</span>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input-field" />
        </label>
        <label className="input-container">
          <span className="input-label">Lozinka</span>
          <div style={{display:"flex", gap:8}}>
            <input type={show ? "text" : "password"} value={password} onChange={(e)=>setPassword(e.target.value)} className="input-field" />
            <button type="button" onClick={()=>setShow(s=>!s)} style={{padding:"6px 10px"}}>{show ? "Hide" : "Show"}</button>
          </div>
        </label>
        {error && <div style={{color:"crimson"}}>{error}</div>}
        <button type="submit" disabled={loading} style={{marginTop:8}}>
          {loading ? "U toku…" : "Uloguj se"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Nemate nalog? <Link to="/register">Registrujte se</Link>
      </p>
    </div>
  );
}
