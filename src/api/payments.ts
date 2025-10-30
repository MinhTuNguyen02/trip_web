import { api } from "./http";
import type { Payment } from "../types";

export async function myPayments() {
  const { data } = await api.get<Payment[]>("/payments");
  return data;
}

export async function getMyPayment(id: string) {
  const { data } = await api.get<Payment>(`/payments/${id}`);
  return data;
}