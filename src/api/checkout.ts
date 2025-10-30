// src/api/checkout.ts
import { api } from "./http";

export type CheckoutLink = {
  provider: "payos";
  orderCode: number;
  checkoutUrl?: string;
  qrCode?: string;
};

// data là danh sách item được chọn kèm thông tin liên hệ từng item
export type CheckoutItem = {
  cart_item_id: string;
  contact_name?: string;
  contact_phone?: string;
  address?: string;
};

export async function createCheckout(items: CheckoutItem[]): Promise<CheckoutLink> {
  const { data } = await api.post("/checkout", { items });
  return data;
}

export async function createCheckoutDemo(items: CheckoutItem[]) {
  const { data } = await api.post("/checkout/demo", { items });
  return data;
}
