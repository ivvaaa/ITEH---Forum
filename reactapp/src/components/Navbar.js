import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user")) || null; }
  catch { return null; }
}

export default function Navbar({ isLoggedIn, setIsLoggedIn, roleId }) {
  const nav = useNavigate();
  const user = getUser();

  const logout = async () => {
    try { await api.post("/api/logout"); } catch {}
    // počisti oba storage-a (pošto koristiš sessionStorage u App-u)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role_id");
    setIsLoggedIn(false);
    nav("/");
  };

  const linkCls = ({ isActive }) =>
    "px-3 py-2" + (isActive ? " font-semibold underline" : "");

  return (
    <header style={{borderBottom:"1px solid #eee"}}>
      <div style={{maxWidth:1000, margin:"0 auto", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <Link to="/" style={{fontWeight:700, textDecoration:"none"}}>ITEH Forum</Link>
        <nav style={{display:"flex", gap:8, alignItems:"center"}}>
          <NavLink to="/" className={linkCls}>Home</NavLink>
          {/* Dodaj i druge linkove po želji */}
          {/* <NavLink to="/threads" className={linkCls}>Teme</NavLink> */}

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" className={linkCls}>Login</NavLink>
              <NavLink to="/register" className={linkCls}>Register</NavLink>
            </>
          ) : (
            <>
              {roleId === 3 && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
              {roleId === 2 && <NavLink to="/moderator" className={linkCls}>Moderator</NavLink>}
              <span style={{color:"#555"}}>{user?.name ? `Hi, ${user.name}` : ""}</span>
              <button onClick={logout} style={{padding:"6px 10px", border:"1px solid #ddd", borderRadius:8, cursor:"pointer"}}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
