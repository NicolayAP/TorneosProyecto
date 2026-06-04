import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, ROLES } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(ROLES.ADMIN);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (pin.length < 3) {
      setError("El PIN debe tener al menos 3 dígitos");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(role, pin);
    setLoading(false);

    if (result.ok) {
      navigate("/");
    } else {
      setError(result.error);
      setPin("");
    }
  }

  return (
    <div className="login-wrapper">

      {/* Topbar igual al Header de la app */}
      <div className="login-topbar">
        <div className="login-brand">
          <div className="login-brand-icon">T</div>
          <span className="login-brand-name">TorneoApp</span>
          <span className="login-brand-badge">PWA</span>
        </div>
      </div>

      {/* Card */}
      <div className="login-card">
        <div className="login-card-header">
          <p className="login-card-eyebrow">Control de Acceso</p>
          <h1 className="login-card-title">Iniciar sesión</h1>
          <p className="login-card-subtitle">Selecciona tu rol e ingresa tu PIN</p>
        </div>

        <div className="login-card-body">
          <form onSubmit={handleSubmit}>

            {/* Selector de rol */}
            <span className="role-label">Tu rol</span>
            <fieldset className="role-group">
              <label className={`role-option ${role === ROLES.ADMIN ? "active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value={ROLES.ADMIN}
                  checked={role === ROLES.ADMIN}
                  onChange={() => { setRole(ROLES.ADMIN); setError(""); }}
                />
                <span className="role-option-icon">🛡️</span>
                Administrador
              </label>
              <label className={`role-option ${role === ROLES.ARBITRO ? "active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value={ROLES.ARBITRO}
                  checked={role === ROLES.ARBITRO}
                  onChange={() => { setRole(ROLES.ARBITRO); setError(""); }}
                />
                <span className="role-option-icon">🟨</span>
                Árbitro
              </label>
            </fieldset>

            {/* PIN */}
            <label htmlFor="pin" className="pin-label">PIN de acceso</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="••••"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
              autoComplete="current-password"
              className="pin-input"
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Verificando..." : "Ingresar →"}
            </button>

            <p className="login-hint">
              Modo offline disponible • Datos guardados localmente
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}