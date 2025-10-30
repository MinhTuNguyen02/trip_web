import { api } from "./http";
import type { TourOption } from "../types";

// Public (đọc danh sách option cho 1 tour)
export async function listTourOptions(tourId: string, params?: { from?: string; to?: string; onlyOpen?: 0|1; onlyFuture?: 0 | 1}) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.onlyOpen) qs.set("onlyOpen", String(params.onlyOpen));
  if (params?.onlyFuture) qs.set("onlyFuture", String(params.onlyFuture));
  const { data } = await api.get<TourOption[]>(`/tours/${tourId}/options${qs.toString() ? `?${qs}` : ""}`);
  return data;
}

// Admin CRUD
export async function adminCreateTourOption(payload: Omit<TourOption, "_id" | "remaining" | "isDisabled">) {
  const { data } = await api.post<TourOption>("/tour-options", payload);
  return data;
}

export async function adminUpdateTourOption(id: string, payload: Partial<Omit<TourOption, "_id" | "tour_id" | "remaining" | "isDisabled">> & { tour_id?: string }) {
  const { data } = await api.put<TourOption>(`/tour-options/${id}`, payload);
  return data;
}

export async function adminDeleteTourOption(id: string) {
  const { data } = await api.delete<{ ok: true }>(`/tour-options/${id}`);
  return data;
}

// Conveniences
export async function adminUpdateTourOptionStatus(id: string, status: TourOption["status"]) {
  const { data } = await api.put<TourOption>(`/tour-options/${id}/status`, { status });
  return data;
}
export async function adminUpdateTourOptionCapacity(id: string, capacity_total: number) {
  const { data } = await api.put<TourOption>(`/tour-options/${id}/capacity`, { capacity_total });
  return data;
}
