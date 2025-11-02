// src/api/tickets.ts
import { api } from "./http";

export type TicketRow = {
  _id: string;
  code: string;
  qr_payload: string;
  status: "valid"|"used"|"refunded"|"void";
  used_at?: string;
  pickup_note?: string;
  passenger?: { name?: string; phone?: string; address?: string };
  createdAt: string;
  updatedAt: string;
  booking: {
    _id: string;
    start_date?: string;
    start_time?: string;
    qty?: number;
    total?: number;
    snapshot_title?: string;
    snapshot_destination_name?: string;
  };
};

export async function listMyTickets(params?: {
  page?: number; limit?: number; status?: string; q?: string; booking_id?: string;
}): Promise<{ rows: TicketRow[]; page: number; limit: number; total: number }> {
  const { data } = await api.get("/tickets", { params });
  return data;
}

export async function getMyTicket(id: string): Promise<TicketRow> {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
}

export async function getMyTicketByCode(code: string): Promise<TicketRow> {
  const { data } = await api.get(`/tickets/code/${encodeURIComponent(code)}`);
  return data;
}
