import { api } from "./http";
import type { ItineraryRequest, ItineraryResponse } from "../types";

export async function buildItinerary(body: ItineraryRequest) {
  const { data } = await api.post<ItineraryResponse>("/ai/itinerary", body);
  return data;
}
