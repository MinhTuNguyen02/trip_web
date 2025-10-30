import { api } from "./http";
import type { FlightQuote } from "../types";

export async function searchFlightQuotes(params: {
  origin: string; dest: string; depart_at: string; return_at?: string;
}) {
  const { data } = await api.get<FlightQuote[]>("/flight-quotes", { params });
  return data;
}
