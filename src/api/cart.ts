import { api } from "./http";
import type { Cart } from "../types";

export async function getCart() {
  const { data } = await api.get<Cart>("/cart");
  return data;
}

export async function addCartItemTour({ tourId, optionId, qty }:{
  tourId:string; optionId:string; qty:number;
}) {
  const { data } = await api.post<Cart>("/cart/items", {
    type: "tour", ref_id: tourId, option_id: optionId, qty
  });
  return data; // <-- trả về Cart
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<Cart>(`/cart/${itemId}`);
  return data;
}

export async function updateCartItemQty(itemId: string, qty: number) {
  const { data } = await api.put<Cart>(`/cart/items/${itemId}`, { qty });
  return data; // <-- Cart
}
