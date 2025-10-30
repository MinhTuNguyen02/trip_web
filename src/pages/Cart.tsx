// src/pages/Cart.tsx
import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartCtx } from "../contexts/CartContext";
import React from "react";

export default function CartPage() {
  const { cart, updateQty, remove } = useContext(CartCtx)!;
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Khi cart thay đổi, giữ tick cũ nếu còn; mặc định tick tất cả lần đầu
  React.useEffect(() => {
    if (!cart?.items) return;
    setSelected(prev => {
      const next: Record<string, boolean> = {};
      for (const i of cart.items) next[i._id] = prev[i._id] ?? true;
      return next;
    });
  }, [cart]);

  const allChecked = useMemo(() => {
    if (!cart?.items?.length) return false;
    return cart.items.every(i => selected[i._id]);
  }, [cart, selected]);

  const anyChecked = useMemo(() => {
    if (!cart?.items?.length) return false;
    return cart.items.some(i => selected[i._id]);
  }, [cart, selected]);

  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items
      .filter(i => selected[i._id])
      .reduce((s, i) => s + i.qty * i.unit_price, 0);
  }, [cart, selected]);

  const toggleAll = (checked: boolean) => {
    if (!cart?.items) return;
    const next: Record<string, boolean> = {};
    for (const i of cart.items) next[i._id] = checked;
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) =>
    setSelected(prev => ({ ...prev, [id]: checked }));

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " đ";

  // tăng/giảm số lượng: optimistic trong provider => không reload cart
  const inc = async (id: string, cur: number) => updateQty(id, cur + 1).catch(e => alert(e.response?.data?.error || e.message));
  const dec = async (id: string, cur: number) => {
    if (cur <= 1) return;
    updateQty(id, cur - 1).catch(e => alert(e.response?.data?.error || e.message));
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
        <div>Chưa có gì. <Link to="/tours" className="underline text-blue-600">Xem tours</Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>

      {/* Thanh chọn tất cả */}
      <div className="mb-3 flex items-center gap-3">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={allChecked} onChange={e => toggleAll(e.target.checked)} />
          <span>Chọn tất cả</span>
        </label>
        {anyChecked ? (
          <span className="text-sm text-slate-600">
            Đã chọn {cart.items.filter(i => selected[i._id]).length}/{cart.items.length} mục
          </span>
        ) : (
          <span className="text-sm text-slate-600">Chưa chọn mục nào</span>
        )}
      </div>

      <ul className="divide-y rounded-xl border overflow-hidden bg-white">
        {cart.items.map(i => {
          const refTitle =
            typeof (i as any).ref_id === "object"
              ? (i as any).ref_id?.title ?? `#${(i as any).ref_id?._id ?? "?"}`
              : `#${i.ref_id}`;
          return (
            <li key={i._id} className="py-3 px-4 flex items-center gap-3">
              <input type="checkbox" checked={!!selected[i._id]} onChange={e => toggleOne(i._id, e.target.checked)} />

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {i.type === "tour" ? `Tour ${refTitle}` : `Sản phẩm ${refTitle}`}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  Đơn giá: <b>{formatVND(i.unit_price)}</b>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    className="w-9 h-9 grid place-items-center hover:bg-slate-50 disabled:opacity-50"
                    disabled={i.qty <= 1}
                    onClick={() => dec(i._id, i.qty)}
                    aria-label="Giảm"
                  >–</button>
                  <div className="w-10 text-center select-none">{i.qty}</div>
                  <button
                    className="w-9 h-9 grid place-items-center hover:bg-slate-50"
                    onClick={() => inc(i._id, i.qty)}
                    aria-label="Tăng"
                  >+</button>
                </div>

                <div className="font-semibold hidden sm:block">
                  {formatVND(i.qty * i.unit_price)}
                </div>

                <button
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => remove(i._id).catch(e => alert(e.response?.data?.error || e.message))}
                  aria-label="Xoá"
                >
                  Xoá
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer tổng & thanh toán */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-lg">
          Tổng ({cart.items.filter(i => selected[i._id]).length} mục): <b>{formatVND(total)}</b>
        </div>

        <Link
          to="/checkout"
          state={{ selectedIds: cart.items.filter(i => selected[i._id]).map(i => i._id) }}
          className={`px-4 py-2 rounded text-white text-center ${
            anyChecked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"
          }`}
          onClick={(e) => { if (!anyChecked) e.preventDefault(); }}
        >
          Thanh toán
        </Link>
      </div>
    </div>
  );
}
