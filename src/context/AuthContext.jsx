import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Constantes ────────────────────────────────────────────────────────────────
const AUTH_KEY = "torneo_auth_session";

export const ROLES = {
  ADMIN: "admin",
  ARBITRO: "arbitro",
};

// PINs por defecto hasheados con SHA-256
// SHA-256("1234") → admin
// SHA-256("123")  → arbitro
const DEFAULT_PINS = {
  [ROLES.ADMIN]:   "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
  [ROLES.ARBITRO]: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
};

// ─── Utilidad SHA-256 (nativa, sin librerías) ───────────────────────────────────
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // { rol, nombre }
  const [cargando, setCargando] = useState(true);

  // Restaurar sesión al recargar
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored) setUsuario(JSON.parse(stored));
    } catch (_) {}
    setCargando(false);
  }, []);

  // Login: valida PIN con SHA-256
  const login = useCallback(async (rol, pin) => {
    const hash = await sha256(pin);
    const expected = DEFAULT_PINS[rol];

    if (!expected || hash !== expected) {
      return { ok: false, error: "PIN incorrecto" };
    }

    const nuevoUsuario = {
      rol,
      nombre: rol === ROLES.ADMIN ? "Administrador" : "Árbitro / Anotador",
      loggedAt: Date.now(),
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
    return { ok: true };
  }, []);

  // Logout
  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook principal ─────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export default AuthContext;