import { api } from "./http";
import type { Destination } from "../types";

export async function listDestinations(params?: { region?: string }) {
  const { data } = await api.get<Destination[]>("/destinations", { params });
  return data;
}

export async function getDestination(id: string) {
  const { data } = await api.get<Destination>(`/destinations/${id}`);
  return data;
}
