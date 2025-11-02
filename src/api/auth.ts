import type { User } from "../types";
import { api, setToken } from "./http";

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  setToken(data.token);
  return data.user as { id: string; name: string; email: string; role?: string };
}

export async function register(name: string, email: string, password: string, phone?: string, address?: string) {
  const { data } = await api.post("/auth/register", { name, email, password, phone, address });
  return data.user;
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data.user as { id: string; name: string; email: string; role?: string; phone?: string; address?: string; is_active?: boolean };
}

export async function updateProfile(payload: {
  name?: string;
  phone?: string;
  address?: string;
}) {
  const { data } = await api.patch("/auth/me", payload);
  return data.user as {
    id: string; name: string; email: string; role?: string; phone?: string; address?: string;
  };
}

// đổi mật khẩu
export async function changePassword(current_password: string, new_password: string) {
  await api.post("/auth/change-password", { current_password, new_password });
}

export function logout() {
  setToken(undefined);
}

export async function toggleUserActive(id: string, is_active: boolean): Promise<User> {
  const { data } = await api.patch(`/auth/users/${id}/active`, { is_active });
  return data;
}
export async function deleteUser(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete(`/auth/users/${id}`);
  return data;
}