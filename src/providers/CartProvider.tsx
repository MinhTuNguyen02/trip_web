import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CartCtx, type CartContextType } from "../contexts/CartContext";
import type { Cart } from "../types";
import { getCart, addCartItemTour, removeCartItem, updateCartItemQty } from "../api/cart";
import { useAuth } from "../hooks/useAuth";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchingId = useRef(0); // chặn race-condition: chỉ nhận kết quả fetch mới nhất

  // count = tổng số lượng (sum qty)
  const count = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((sum, it) => sum + (it.qty ?? 0), 0);
  }, [cart]);

  const doFetch = useCallback(
    async (silent = false) => {
      if (!user) {
        setCart(null);
        setLoading(false);
        return;
      }
      const myId = ++fetchingId.current;
      if (!silent) setLoading(true);
      try {
        const data = await getCart();
        if (myId === fetchingId.current) setCart(data);
      } catch {
        // giữ nguyên state nếu lỗi mạng/401
      } finally {
        if (myId === fetchingId.current) setLoading(false);
      }
    },
    [user]
  );

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => doFetch(!!opts?.silent),
    [doFetch]
  );

  // Lần đầu & khi user thay đổi
  useEffect(() => {
    if (user) refresh({ silent: true });
    else {
      setCart(null);
      setLoading(false);
    }
  }, [user, refresh]);

  // ---------- Optimistic helpers ----------
  const patchItemQtyLocal = useCallback((itemId: string, qty: number) => {
    setCart(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(it => (it._id === itemId ? { ...it, qty } : it)),
      };
    });
  }, []);

  const removeItemLocal = useCallback((itemId: string) => {
    setCart(prev => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter(it => it._id !== itemId) };
    });
  }, []);

  // ---------- Actions ----------
  const addTourItem = useCallback<CartContextType["addTourItem"]>(async ({ tourId, optionId, qty }) => {
    if (!user) throw new Error("Not authenticated");
    // server trả lại toàn bộ Cart (đã populate tối thiểu)
    const next = await addCartItemTour({ tourId, optionId, qty });
    setCart(next as unknown as Cart);
  }, [user]);

  const updateQty = useCallback<CartContextType["updateQty"]>(async (itemId, qty) => {
    if (qty < 1) return;
    // optimistic trước để mượt UI
    patchItemQtyLocal(itemId, qty);
    try {
      const next = await updateCartItemQty(itemId, qty);
      setCart(next as unknown as Cart);
    } catch (e) {
      // rollback bằng cách refetch silent
      await refresh({ silent: true });
      throw e;
    }
  }, [patchItemQtyLocal, refresh]);

  const remove = useCallback<CartContextType["remove"]>(async (itemId) => {
    // optimistic remove
    removeItemLocal(itemId);
    try {
      const next = await removeCartItem(itemId);
      setCart(next as unknown as Cart);
    } catch (e) {
      await refresh({ silent: true });
      throw e;
    }
  }, [removeItemLocal, refresh]);

  const clearLocal = useCallback(() => {
    setCart(null);
    setLoading(false);
  }, []);

  const value: CartContextType = useMemo(
    () => ({
      cart,
      loading,
      count,        // tổng qty
      refresh,
      addTourItem,
      updateQty,
      remove,
      clearLocal,
    }),
    [cart, loading, count, refresh, addTourItem, updateQty, remove, clearLocal]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
