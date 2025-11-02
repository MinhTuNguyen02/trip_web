import { api } from "./http";
import type { POI } from "../types";

export async function listPOIs(params?: { destination?: string; type?: string }) {
  const { data } = await api.get<POI[]>("/pois", { params }); 
  return data;
}
