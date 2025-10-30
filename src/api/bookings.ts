// src/api/booking.ts
import { api } from "./http";
import type { Booking } from "../types";

export type BookingListResp = {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
};

export async function listMyBookings(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<BookingListResp>("/bookings", { params });
  return data; // { items, total, page, limit }
}

export async function getMyBooking(id: string) {
  const { data } = await api.get<Booking>(`/bookings/${id}`);
  return data;
}
