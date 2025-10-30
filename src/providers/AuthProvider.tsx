import React, { useEffect, useState } from "react";
import { AuthCtx, type AuthContextType, type User } from "../contexts/AuthContext";
import { login as apiLogin, me as apiMe, logout as apiLogout, register as apiRegister } from "../api/auth";

function normalizeUser(u: any): NonNullable<User> {
  if (!u) return null as any;
  return {
    id: u.id ?? u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone ?? undefined,
    address: u.address ?? undefined,
  };
}

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    apiMe()
      .then((u) => setUser(normalizeUser(u)))
      .finally(() => setLoading(false));
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    await apiLogin(email, password);
    const u = await apiMe();
    setUser(normalizeUser(u));
  };

  const register: AuthContextType["register"] = async (name, email, password, phone?, address?) => {
    await apiRegister(name, email, password, phone, address);
    await apiLogin(email, password);
    const u = await apiMe();
    setUser(normalizeUser(u));
  };

  const logout: AuthContextType["logout"] = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

export default AuthProvider;
