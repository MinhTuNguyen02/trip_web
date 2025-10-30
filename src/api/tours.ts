import { api } from "./http";
import type { Tour } from "../types";

export async function listTours(params?: { destination?: string }) {
  const { data } = await api.get<Tour[]>("/tours", { params });
  return data;
}

export async function getTour(id: string) {
  const { data } = await api.get<Tour>(`/tours/${id}`);
  return data;
}