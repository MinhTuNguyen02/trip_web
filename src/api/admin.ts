import { api } from "./http";
import type { Tour, Destination, POI, User } from "../types";

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
export type ListParams = {
  q?: string;            // tìm theo email, tên user, title, orderCode
  status?: string;       // booking status
  payment_status?: string;
  date_from?: string;    // ISO yyyy-mm-dd
  date_to?: string;      // ISO yyyy-mm-dd
  limit?: number;
  page?: number;         // 1-based
};

export type ListResp = {
  items: AdminBooking[];
  total: number;
  page: number;
  pages: number;
};
export type AdminBooking = {
  _id: string;
  user: { _id: string; name: string; email: string } | string; // tuỳ populate
  user_id?: string;
  tour_id: string;
  option_id: string;
  snapshot_title?: string;
  start_date?: string;   // ISO
  start_time?: string;   // "HH:mm"
  qty: number;
  unit_price: number;
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  payment_id?: string;
  createdAt: string;
  updatedAt: string;
  tickets?: Array<{
    _id: string;
    code: string;
    status: "valid" | "used" | "void";
    passenger?: { name?: string; phone?: string; address?: string };
  }>;
  payment?: {
    provider: string;
    intent_id?: string; // orderCode
    status: string;
  };
};