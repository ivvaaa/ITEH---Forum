import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./adminStats.css";

const INITIAL_FILTERS = { search: "", role: "" };

const AdminStats = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadRoles = useCallback(async () => {
    try {
      const res = await api.get("/api/roles");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRoles(payload);
    } catch (err) {
      console.error(err);
      setError(prev => prev || "Neuspesno ucitavanje lista rola.");
    }
  }, []);

  const loadUsers = useCallback(async (activeFilters = INITIAL_FILTERS) => {
    setLoading(true);
    const trimmedSearch = activeFilters.search?.trim() || "";
    const roleFilter = activeFilters.role || "";

    try {
      let response;
      if (trimmedSearch || roleFilter) {
        const params = {};
        if (trimmedSearch) params.q = trimmedSearch;
        if (roleFilter) params.role = roleFilter;
        params.per_page = 100;
        response = await api.get("/api/users/search", { params });
      } else {
        response = await api.get("/api/users");
      }

      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setUsers(list);
      setError("");
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Neuspesno ucitavanje korisnika.";
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers({ ...INITIAL_FILTERS });
    loadRoles();
  }, [loadUsers, loadRoles]);

  const roleOptions = useMemo(() => {
    if (roles.length > 0) {
      return roles;
    }
    const fallback = new Map();
    users.forEach(user => {
      if (user?.role) {
        const roleId = user.role.id ?? user.role_id;
        if (!fallback.has(roleId)) {
          fallback.set(roleId, {
            id: roleId,
            name: user.role.name ?? `Role #${roleId}`,
          });
        }
      } else if (user.role_id != null && !fallback.has(user.role_id)) {
        fallback.set(user.role_id, {
          id: user.role_id,
          name: `Role #${user.role_id}`,
        });
      }
    });
    return Array.from(fallback.values());
  }, [roles, users]);

  const stats = useMemo(() => {
    const perRole = users.reduce((acc, user) => {
      const label =
        user?.role?.name || (user.role_id != null ? `Role #${user.role_id}` : "Bez dodeljene role");
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return { total: users.length, perRole };
  }, [users]);

  const handleFilterChange = event => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = event => {
    event.preventDefault();
    loadUsers(filters);
  };

  const handleResetFilters = () => {
    const reset = { ...INITIAL_FILTERS };
    setFilters(reset);
    loadUsers(reset);
  };

  const handleRoleUpdate = async (userId, roleId) => {
    setUpdatingId(userId);
    setError("");
    try {
      await api.put(`/api/users/${userId}/role`, { role_id: roleId });
      await loadUsers(filters);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Azuriranje role nije uspelo.";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async userId => {
    if (!window.confirm("Da li si siguran da zelis da obrises korisnika?")) {
      return;
    }
    setDeletingId(userId);
    setError("");
    try {
      await api.delete(`/api/users/${userId}`);
      await loadUsers(filters);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Brisanje korisnika nije uspelo.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-stats-page">
      <section className="admin-card">
        <header className="admin-stats-header">
          <div className="admin-stats-heading">
            <h1>Statistika korisnika</h1>
          </div>
          <div className="admin-stats-summary">
            <div className="summary-card summary-card--highlight">
              <span className="summary-label">Ukupno korisnika</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="summary-list">
              {Object.entries(stats.perRole).map(([label, count]) => (
                <div key={label} className="summary-card">
                  <span className="summary-label">{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </header>

        <form className="admin-stats-filters" onSubmit={handleFilterSubmit}>
          <div className="filter-group">
            <label htmlFor="filter-search">Pretraga</label>
            <input
              id="filter-search"
              name="search"
              className="filter-input"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Ime ili email"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="filter-role">Rola</label>
            <select
              id="filter-role"
              name="role"
              className="filter-select"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">Sve role</option>
              {roleOptions.map(role => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button type="submit" className="admin-btn primary">
              Primeni
            </button>
            <button type="button" className="admin-btn ghost" onClick={handleResetFilters}>
              Resetuj
            </button>
          </div>
        </form>

        {error && <div className="admin-stats-error">{error}</div>}

        {loading ? (
          <div className="admin-stats-status">Ucitavanje korisnika...</div>
        ) : users.length === 0 ? (
          <div className="admin-stats-status">Nema korisnika za prikaz.</div>
        ) : (
          <div className="admin-stats-table-wrapper">
            <table className="admin-stats-table">
              <thead>
                <tr>
                  <th>Korisnik</th>
                  <th>Email</th>
                  <th>Rola</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={user.role_id != null ? String(user.role_id) : ""}
                        onChange={event => {
                          const nextRoleId = Number(event.target.value);
                          if (!nextRoleId || nextRoleId === user.role_id) return;
                          handleRoleUpdate(user.id, nextRoleId);
                        }}
                        disabled={
                          updatingId === user.id ||
                          deletingId === user.id ||
                          roleOptions.length === 0
                        }
                      >
                        {roleOptions.map(role => (
                          <option key={role.id} value={String(role.id)}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingId === user.id || updatingId === user.id}
                      >
                        {deletingId === user.id ? "Brisanje..." : "Obrisi"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminStats;
