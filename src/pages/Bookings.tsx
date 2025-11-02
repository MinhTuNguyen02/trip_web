/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listMyBookings } from "../api/bookings";
import type { Booking } from "../types";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " đ";

type PageResp = { items: Booking[]; total: number; page: number; limit: number };

export default function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    try {
      const data: any = await listMyBookings();
      const normalized: PageResp = Array.isArray(data)
        ? { items: data, total: data.length, page: 1, limit: data.length || 10 }
        : data;
      setItems(normalized.items);
      setTotal(normalized.total);
      setPage(normalized.page);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  if (loading) return <div className="p-6">Đang tải đơn đã đặt…</div>;

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Đơn đã đặt</h1>
        <div className="text-slate-600">Bạn chưa có đơn nào. Hãy chọn tour và thanh toán nhé!</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Đơn đã đặt</h1>

      <div className="divide-y border rounded-xl bg-white">
        {items.map((b) => {
          const code = `#${b._id.slice(-6).toUpperCase()}`;
          const created = new Date(b.createdAt).toLocaleString("vi-VN");
          const paymentBadge =
            b.payment_status === "paid"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : b.payment_status === "failed"
              ? "text-rose-700 bg-rose-50 border-rose-200"
              : "text-amber-700 bg-amber-50 border-amber-200";
          const statusBadge =
            b.status === "confirmed"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : b.status === "cancelled"
              ? "text-rose-700 bg-rose-50 border-rose-200"
              : b.status === "completed"
              ? "text-indigo-700 bg-indigo-50 border-indigo-200"
              : "text-slate-700 bg-slate-50 border-slate-200";

          const title = b.snapshot_title || "Tour";
          const when = [
            b.start_date ? new Date(b.start_date).toISOString().slice(0, 10) : null,
            b.start_time || null,
          ].filter(Boolean).join(" • ");

          return (
            <Link
              key={b._id}
              to={`/bookings/${b._id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="font-medium">{code} — {title}</div>
                <div className="text-sm text-slate-600">
                  {created} • {when || "—"} • SL: <b>{b.qty}</b>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded-full border ${paymentBadge}`}>
                    thanh toán: {b.payment_status}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full border ${statusBadge}`}>
                    trạng thái: {b.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{vnd(b.total)}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex justify-end items-center gap-2">
          <button className="px-3 py-1 rounded border disabled:opacity-50" disabled={page <= 1} onClick={() => load(page - 1)}>
            Trước
          </button>
          <div className="text-sm">Trang {page}/{pages}</div>
          <button className="px-3 py-1 rounded border disabled:opacity-50" disabled={page >= pages} onClick={() => load(page + 1)}>
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
