import { createContext, useContext } from "react";
import type { Cart } from "../types";

export type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  /** Tổng số lượng (sum qty) của mọi item trong giỏ */
  count: number;
  /** Tải lại từ server (silent: không bật spinner) */
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  /** Thêm tour vào giỏ */
  addTourItem: (args: { tourId: string; optionId: string; qty: number }) => Promise<void>;
  /** Cập nhật số lượng 1 item (optimistic) */
  updateQty: (itemId: string, qty: number) => Promise<void>;
  /** Xoá 1 item (optimistic) */
  remove: (itemId: string) => Promise<void>;
  /** Xoá local state (khi logout, v.v.) */
  clearLocal: () => void;
};

export const CartCtx = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
};
