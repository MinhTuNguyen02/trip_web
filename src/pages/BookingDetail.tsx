import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyBooking } from "../api/bookings";
import type { Booking } from "../types";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " đ";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [b, setB] = useState<Booking | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setErr("Thiếu mã booking"); return; }
    getMyBooking(id)
      .then(setB)
      .catch(e => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  if (err) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Chi tiết đơn</h1>
        <div className="text-rose-600">{err}</div>
        <Link to="/bookings" className="inline-block mt-4 px-4 py-2 rounded border">Về danh sách</Link>
      </div>
    );
  }
  if (!b) return <div className="p-6">Đang tải…</div>;

  const code = `#${b._id.slice(-6).toUpperCase()}`;
  const created = new Date(b.createdAt).toLocaleString("vi-VN");

  const badge = (kind: "status" | "payment") => {
    const val = kind === "payment" ? b.payment_status : b.status;
    if (kind === "payment") {
      return val === "paid"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : val === "failed"
        ? "text-rose-700 bg-rose-50 border-rose-200"
        : "text-amber-700 bg-amber-50 border-amber-200";
    }
    return val === "confirmed"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : val === "cancelled"
      ? "text-rose-700 bg-rose-50 border-rose-200"
      : val === "completed"
      ? "text-indigo-700 bg-indigo-50 border-indigo-200"
      : "text-slate-700 bg-slate-50 border-slate-200";
  };

  const title = b.snapshot_title || "Tour";
  const when = [
    b.start_date ? new Date(b.start_date).toISOString().slice(0, 10) : null,
    b.start_time || null
  ].filter(Boolean).join(" • ");

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn {code}</h1>
          <div className="text-sm text-slate-600">{created}</div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`inline-block px-2 py-0.5 rounded-full border ${badge("payment")}`}>
              thanh toán: {b.payment_status}
            </span>
            <span className={`inline-block px-2 py-0.5 rounded-full border ${badge("status")}`}>
              trạng thái: {b.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Tổng tiền</div>
          <div className="text-xl font-semibold">{vnd(b.total)}</div>
        </div>
      </div>

      <div className="mt-4 divide-y rounded-xl border overflow-hidden bg-white">
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{title}</div>
              <div className="text-sm text-slate-600">
                Khởi hành: <b>{when || "—"}</b>
              </div>
              {b.pickup_note && (
                <div className="text-sm text-slate-600">
                  Điểm đón: <b>{b.pickup_note}</b>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm">SL: <b>{b.qty}</b></div>
              <div className="text-sm">Đơn giá: <b>{vnd(b.unit_price)}</b></div>
              <div className="font-semibold">{vnd(b.total)}</div>
            </div>
          </div>

          {(b.contact_name || b.contact_phone) && (
            <div className="text-sm text-slate-600">
              Liên hệ: {b.contact_name || "—"} {b.contact_phone ? `• ${b.contact_phone}` : ""}
            </div>
          )}
          {b.note && <div className="text-sm text-slate-600">Ghi chú: {b.note}</div>}
        </div>
      </div>

      <div className="mt-4">
        <Link to="/bookings" className="px-4 py-2 rounded border inline-block">Về danh sách</Link>
      </div>
    </div>
  );
}
