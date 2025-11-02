import { createContext } from "react";

export type User = { id: string; name: string; email: string; role?: string, phone?: string, address?: string, is_active?: boolean; } | null;

export type AuthContextType = {
  user: User;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, phone?: string, address?: string): Promise<void>;
  logout(): void;
};

// Chỉ export context, không export component => không vi phạm rule
export const AuthCtx = createContext<AuthContextType | undefined>(undefined);
