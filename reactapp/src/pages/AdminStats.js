import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

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

      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setUsers(list);
      setError("");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "Neuspesno ucitavanje korisnika.";
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
        user?.role?.name ||
        (user.role_id != null ? `Role #${user.role_id}` : "Bez dodeljene role");
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
      const message =
        err.response?.data?.message || "Azuriranje role nije uspelo.";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async userId => {
    const confirmed = window.confirm(
      "Da li ste sigurni da zelite da obrisete korisnika?"
    );
    if (!confirmed) {
      return;
    }
    setDeletingId(userId);
    setError("");
    try {
      await api.delete(`/api/users/${userId}`);
      await loadUsers(filters);
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "Brisanje korisnika nije uspelo.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const roleStatsEntries = Object.entries(stats.perRole);

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 16px" }}>
      <h1>Admin statistika</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Pregledaj korisnike, menjaj role i ukloni naloge po potrebi.
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "12px 16px",
            minWidth: 180,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.total}</div>
          <div style={{ color: "#666" }}>Ukupno korisnika</div>
        </div>
        {roleStatsEntries.map(([roleName, count]) => (
          <div
            key={roleName}
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: "12px 16px",
              minWidth: 180,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600 }}>{count}</div>
            <div style={{ color: "#666" }}>{roleName}</div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleFilterSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Pretrazi ime ili email"
          style={{ minWidth: 200, padding: 8 }}
        />
        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          style={{ minWidth: 180, padding: 8 }}
        >
          <option value="">Sve role</option>
          {roleOptions.map(role => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Primeni filtere
        </button>
        <button
          type="button"
          onClick={handleResetFilters}
          style={{ padding: "8px 16px" }}
        >
          Resetuj
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: 16, color: "#b00020" }}>{error}</div>
      )}

      {loading ? (
        <div>Ucitavanje korisnika...</div>
      ) : users.length === 0 ? (
        <div>Nema korisnika za prikaz.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Korisnik
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Rola
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{user.name}</td>
                  <td style={{ padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>
                    <select
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
                      style={{ padding: 6 }}
                    >
                      {roleOptions.map(role => (
                        <option key={role.id} value={String(role.id)}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deletingId === user.id || updatingId === user.id}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #d32f2f",
                        background: "#fbeaea",
                        color: "#d32f2f",
                        cursor:
                          deletingId === user.id || updatingId === user.id
                            ? "not-allowed"
                            : "pointer",
                      }}
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
    </div>
  );
};

export default AdminStats;
