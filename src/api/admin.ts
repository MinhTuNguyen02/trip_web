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
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get("/auth/users"); // backend trả toàn bộ user
  return data;
}

export async function listAdmins(): Promise<User[]> {
  const { data } = await api.get("/auth/admins"); // hoặc /admin/users?role=admin
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


export async function adminListBookings(params: ListParams): Promise<ListResp> {
  const { data } = await api.get("/admin/", { params });
  return data;
}

export async function adminGetBooking(id: string): Promise<AdminBooking> {
  const { data } = await api.get(`/admin/${id}`); // <-- thêm /
  return data;
}

export type RevenuePoint = { _id: string; revenue: number };

export async function getSummary() {
  const { data } = await api.get("/dashboard/summary");
  return data as { users: number; tours: number; bookings: number; revenue: number };
}

export async function getRevenue(range: "day" | "month" | "year" = "month") {
  const { data } = await api.get<RevenuePoint[]>("/dashboard/revenue", { params: { range } });
  return data;
}

export async function getTopDestinations() {
  const { data } = await api.get<Array<{ _id: string; count: number }>>(
    "/dashboard/destinations"
  );
  return data;
}

