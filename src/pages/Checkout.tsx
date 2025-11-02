/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Checkout.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { createCheckout, createCheckoutDemo, type CheckoutLink } from "../api/checkout";
import { CartCtx } from "../contexts/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type LocState = { selectedIds?: string[] } | null;
type ContactForm = { contact_name?: string; contact_phone?: string; address?: string };
const phoneRegex = /^\+?[0-9]{8,15}$/;

export default function Checkout() {
  const { state } = useLocation();
  const selectedIds = ((state as LocState)?.selectedIds ?? []).filter(Boolean);
  const { cart } = useContext(CartCtx)!;
  const { user } = useAuth();
  const nav = useNavigate();

  // Chuẩn hoá chuỗi id để làm dependency ổn định
  const selectedIdsStr = useMemo(
    () => [...selectedIds].sort().join("|"),
    [selectedIds]
  );

  // Chỉ lọc các item đã chọn; phụ thuộc vào chuỗi id đã ổn định + mảng items
  const selectedItems = useMemo(() => {
    if (!cart?.items?.length) return [];
    const set = new Set(selectedIds);
    return cart.items.filter((i) => set.has(i._id));
  }, [cart?.items, selectedIdsStr]);

  const [forms, setForms] = useState<Record<string, ContactForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<CheckoutLink | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Effect khởi tạo/đồng bộ forms: chỉ chạy khi bộ id đã chọn thực sự thay đổi
  const selKeys = useMemo(
    () => selectedItems.map((i) => i._id).sort().join("|"),
    [selectedItems]
  );

  useEffect(() => {
    setForms((prev) => {
      const next: Record<string, ContactForm> = {};
      for (const it of selectedItems) next[it._id] = prev[it._id] ?? {};
      // So sánh nông: nếu không đổi key -> không setState để tránh loop
      const prevKeys = Object.keys(prev).sort().join("|");
      const nextKeys = Object.keys(next).sort().join("|");
      if (prevKeys === nextKeys) return prev; // không thay đổi -> không render lại
      return next;
    });
  }, [selKeys, selectedItems]);

  const total = useMemo(
    () => selectedItems.reduce((s, i) => s + i.qty * i.unit_price, 0),
    [selectedItems]
  );
  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " đ";

  const validate = (): string | null => {
    if (!selectedItems.length) return "Bạn chưa chọn mục nào để thanh toán.";
    for (const it of selectedItems) {
      const f = forms[it._id] || {};
      if (f.contact_phone && !phoneRegex.test(f.contact_phone.trim())) {
        return `Số điện thoại không hợp lệ ở mục ${renderItemTitle(it)}.`;
      }
    }
    return null;
  };

  function fillForMe(id: string) {
    if (!user) return;
    setForms(prev => ({
      ...prev,
      [id]: {
        contact_name: user.name ?? "",
        contact_phone: user.phone ?? "",
        address: user.address ?? "",
      }
    }));
  }

  const onChangeField = (id: string, field: keyof ContactForm, value: string) => {
    setForms((prev) => {
      const cur = prev[id] ?? {};
      const nextForId = { ...cur, [field]: value };
      // Nếu không đổi giá trị thì trả lại prev để tránh render dư
      if (cur[field] === value) return prev;
      return { ...prev, [id]: nextForId };
    });
  };

  function renderItemTitle(i: any) {
    const refTitle =
      typeof i.ref_id === "object"
        ? i.ref_id?.title ?? `#${i.ref_id?._id ?? "?"}`
        : `#${i.ref_id}`;
    return i.type === "tour" ? `Tour ${refTitle}` : `Sản phẩm ${refTitle}`;
  }

  async function handleCreate() {
    setErr(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    try {
      setSubmitting(true);
      const items = selectedItems.map((it) => ({
        cart_item_id: it._id,
        contact_name: forms[it._id]?.contact_name?.trim() || undefined,
        contact_phone: forms[it._id]?.contact_phone?.trim() || undefined,
        address: forms[it._id]?.address?.trim() || undefined,
      }));
      const resp = await createCheckout(items);
      setLink(resp);
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Tạo thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateDemo() {
    setErr(null);
    const v = validate();
    if (v) { setErr(v); return; }
  
    try {
      setSubmitting(true);
      const items = selectedItems.map((it) => ({
        cart_item_id: it._id,
        contact_name: forms[it._id]?.contact_name?.trim() || undefined,
        contact_phone: forms[it._id]?.contact_phone?.trim() || undefined,
        address: forms[it._id]?.address?.trim() || undefined,
      }));
      const resp = await createCheckoutDemo(items); // { ok:true, orderCode }
      // điều hướng ngay -> trang Success có thể tự refetch cart/booking
      nav(`/checkout/success?order=${resp.orderCode}`, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Demo thanh toán thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (!selectedItems.length && !link && !submitting) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
        <p className="text-rose-600">Bạn chưa chọn mục nào để thanh toán.</p>
        <Link to="/cart" className="inline-block mt-4 px-4 py-2 rounded bg-slate-900 text-white">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

      {err && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded">
          {err}
        </div>
      )}

      {link ? (
        <div className="text-center">
          {link.checkoutUrl && (
            <a
              className="px-4 py-2 rounded bg-slate-900 text-white inline-block"
              href={link.checkoutUrl}
              target="_blank"
              rel="noreferrer"
            >
              Mở trang thanh toán
            </a>
          )}
          {link.qrCode && <img src={link.qrCode} alt="QR" className="mx-auto mt-4 w-64 h-64" />}
          <p className="mt-4 text-slate-600">
            Sau khi thanh toán, bạn sẽ được chuyển về trang <b>Thành công</b>.
          </p>
          <Link to="/cart" className="inline-block mt-4 px-4 py-2 rounded border">
            Về giỏ hàng
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y rounded-xl border overflow-hidden bg-white">
            {selectedItems.map((i) => {
              const f = forms[i._id] || {};
              return (
                <li key={i._id} className="py-4 px-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{renderItemTitle(i)}</div>
                      <div className="text-sm text-slate-600 mt-0.5">
                        Số lượng: <b>{i.qty}</b> • Đơn giá: <b>{formatVND(i.unit_price)}</b> • Thành tiền:{" "}
                        <b>{formatVND(i.qty * i.unit_price)}</b>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fillForMe(i._id)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 shrink-0 cursor-pointer"
                    >
                      Đặt cho chính mình
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-sm text-slate-600">Tên liên hệ (tuỳ chọn)</span>
                      <input
                        className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                        placeholder="Nguyễn Văn A"
                        value={f.contact_name ?? ""}
                        onChange={(e) => onChangeField(i._id, "contact_name", e.target.value)}
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-sm text-slate-600">SĐT liên hệ (tuỳ chọn)</span>
                      <input
                        className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                        placeholder="+84901234567"
                        value={f.contact_phone ?? ""}
                        onChange={(e) => onChangeField(i._id, "contact_phone", e.target.value)}
                      />
                    </label>

                    <label className="sm:col-span-2 space-y-1">
                      <span className="text-sm text-slate-600">Địa chỉ (tuỳ chọn)</span>
                      <input
                        className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                        placeholder="Số nhà/đường, phường/xã, quận/huyện, tỉnh/thành"
                        value={f.address ?? ""}
                        onChange={(e) => onChangeField(i._id, "address", e.target.value)}
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-lg">
              Tổng ({selectedItems.length} mục): <b>{formatVND(total)}</b>
            </div>
            <div className="flex gap-3">
              <Link to="/cart" className="px-4 py-2 rounded border">Quay lại giỏ hàng</Link>
              <button
                onClick={handleCreateDemo}
                disabled={submitting}
                className={`px-4 py-2 rounded text-white ${
                  submitting ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {submitting ? "Đang thanh toán" : "Demo thanh toán"}
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className={`px-4 py-2 rounded text-white ${
                  submitting ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {submitting ? "Đang tạo link…" : "Tạo link thanh toán"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
