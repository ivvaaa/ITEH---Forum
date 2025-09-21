import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../api/hooks/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const roleId = user?.role_id || user?.role?.id || null;
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch {
      // ignore logout errors so UI can proceed
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role_id");
    logout();
    nav("/");
  };

  const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
  const navGhostButton = ({ isActive }) => `nav-btn ghost${isActive ? " active" : ""}`;

  return (
    <header className="app-navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          CARTEH<span>FORUM</span>
        </Link>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              {(roleId === 1 || roleId === 2) && (
                <>
                  <NavLink to="/create" className={navGhostButton}>
                    Kreiraj post
                  </NavLink>
                  <NavLink to="/posts" className={navGhostButton}>
                    Moji postovi
                  </NavLink>
                </>
              )}
              {roleId === 1 && (
                <NavLink to="/statistika" className={navGhostButton}>
                  Statistika
                </NavLink>
              )}
              <span className="nav-user">{user?.name ? `Zdravo, ${user.name}` : ""}</span>
              <button type="button" className="nav-btn outline" onClick={handleLogout}>
                Odjava
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navGhostButton}>
                Prijava
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `nav-btn primary${isActive ? " active" : ""}`}>
                Registracija
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}