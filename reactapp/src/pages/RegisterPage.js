import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./authPages.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "2",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await axios.post("http://127.0.0.1:8000/api/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const apiError =
        err.response?.data?.message ||
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        "Doslo je do greske. Pokusajte ponovo.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Registracija</h1>
        <p className="auth-subtitle">Kreirajte nalog i postanite deo CARTEH zajednice.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>Ime i prezime</span>
            <input
              className="auth-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Unesite puno ime"
              required
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="primer@domen.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Lozinka</span>
            <div className="auth-input-group">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Odaberite lozinku"
                required
              />
              <button type="button" className="auth-toggle" onClick={toggleShowPassword}>
                {showPassword ? "Sakrij" : "Prikazi"}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span>Potvrdite lozinku</span>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Ponovo unesite lozinku"
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Registracija..." : "Registruj se"}
          </button>
        </form>

        <p className="auth-footer">
          Vec imate nalog? <Link to="/login" className="auth-link">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


