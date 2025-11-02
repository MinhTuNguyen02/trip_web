import { api } from "./http";
import type { Tour, Destination, POI, User, ListParams, ListResp, AdminBooking } from "../types";

/* --------- Tours --------- */
export async function adminCreateTour(body: Partial<Tour>) {
  const { data } = await api.post<Tour>("/tours", body);
  return data;
}
export async function adminUpdateTour(id: string, body: Partial<Tour>) {
  const { data } = await api.put<Tour>(`/tours/${id}`, body);
  return data;
}
export async function adminDeleteTour(id: string) {
  await api.delete(`/tours/${id}`);
}
export async function adminToggleTourActive(id: string, is_active: boolean) {
  const { data } = await api.put(`/tours/${id}/active`, { is_active });
  return data;
}

/* --------- POIs --------- */
export async function adminCreatePOI(body: Partial<POI>) {
  const { data } = await api.post<POI>("/pois", body);
  return data;
}
export async function adminUpdatePOI(id: string, body: Partial<POI>) {
  const { data } = await api.put<POI>(`/pois/${id}`, body);
  return data;
}
export async function adminDeletePOI(id: string) {
  await api.delete(`/pois/${id}`);
}
export async function adminTogglePOIActive(id: string, is_active: boolean) {
  const { data } = await api.put(`/pois/${id}/active`, { is_active });
  return data as POI;
}


/* --------- Destinations --------- */
export async function adminCreateDestination(body: Partial<Destination>) {
  const { data } = await api.post<Destination>("/destinations", body);
  return data;
}
export async function adminUpdateDestination(id: string, body: Partial<Destination>) {
  const { data } = await api.put<Destination>(`/destinations/${id}`, body);
  return data;
}
export async function adminDeleteDestination(id: string) {
  await api.delete(`/destinations/${id}`);
}
export async function adminToggleDestinationActive(id: string, is_active: boolean) {
  const { data } = await api.put(`/destinations/${id}/active-hard`, { is_active });
  return data as Destination;
}

/* --------- Users --------- */
export async function listUsers(q?: string): Promise<User[]> {
  const { data } = await api.get("/auth/users", {
    params: q ? { q } : undefined, // hoặc { params: { q: q ?? "" } }
  });
  return data;
}

export async function listAdmins(q?: string): Promise<User[]> {
  const { data } = await api.get("/auth/admins", {
    params: q ? { q } : undefined,
  });
  return data;
}

export async function createAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const { data } = await api.post("/auth/admins", input); // backend phải set role=admin
  return data;
}

/* --------- Bookings --------- */
export async function adminListBookings(params: ListParams): Promise<ListResp> {
  const { data } = await api.get("/admin/", { params });
  return data;
}

export async function adminGetBooking(id: string): Promise<AdminBooking> {
  const { data } = await api.get(`/admin/${id}`); // <-- thêm /
  return data;
}

/* --------- Dashboard --------- */
export async function getSummary(): Promise<{ users: number; tours: number }> {
  const { data } = await api.get("/dashboard/summary");
  return data;
}

export type SeriesRange = "day" | "month" | "year";
export type SeriesPoint = { label: string; orders: number; revenue: number };

export async function getSeries(params: {
  range: SeriesRange;
  dateFrom?: string; // YYYY-MM-DD (range=day)
  dateTo?: string;   // YYYY-MM-DD (range=day)
  year?: number;     // (range=month)
}): Promise<SeriesPoint[]> {
  const { data } = await api.get<SeriesPoint[]>("/dashboard/series", { params });
  return data;
}

export async function getTopDestinations(params: {
  range: SeriesRange;
  dateFrom?: string;
  dateTo?: string;
  year?: number;
}): Promise<Array<{ destination_id: string; name: string; travellers: number }>> {
  const { data } = await api.get("/dashboard/top-destinations", { params });
  return data;
}

