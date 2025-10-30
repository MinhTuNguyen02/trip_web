import { useContext } from "react";
import { AuthCtx } from "../contexts/AuthContext";
import type { AuthContextType } from "../contexts/AuthContext";

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
