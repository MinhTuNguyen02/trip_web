// src/pages/BookingsManage.tsx
import React from "react";
import {
  adminListBookings,
  adminGetBooking,
  type AdminBooking,
  type ListParams,
} from "../api/admin";

type StatusOpt = "" | "pending" | "confirmed" | "cancelled";
type PayStatusOpt = "" | "unpaid" | "paid" | "refunded";

const fmtVND = (n: number) => (n ?? 0).toLocaleString("vi-VN") + " đ";
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString("vi-VN") : "—");

function Badge({ color, children }: { color: "gray"|"emerald"|"amber"|"rose"|"sky"; children: React.ReactNode }) {
  const cls = {
    gray:    "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber:   "bg-amber-50 text-amber-700",
    rose:    "bg-rose-50 text-rose-700",
    sky:     "bg-sky-50 text-sky-700",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cls}`}>
      {children}
    </span>
  );
}

function RowSkel() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="p-2">
          <div className="h-4 bg-slate-200 rounded" />
        </td>
      ))}
    </tr>
  );
}

export default function BookingsManage() {
  // ---------------- Filters ----------------
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<StatusOpt>("");
  const [paymentStatus, setPaymentStatus] = React.useState<PayStatusOpt>("");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");

  // ---------------- Data ----------------
  const [items, setItems] = React.useState<AdminBooking[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  // Details modal
  const [detail, setDetail] = React.useState<AdminBooking | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  // table page size
  const LIMIT = 12;

  const load = React.useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const params: ListParams = {
        q: q.trim() || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: LIMIT,
        page: p,
      };
      const resp = await adminListBookings(params);
      setItems(resp.items);
      setTotal(resp.total);
      setPage(resp.page);
      setPages(resp.pages);
    } finally {
      setLoading(false);
    }
  }, [q, status, paymentStatus, dateFrom, dateTo]);

  // Debounce filters
  const debounceRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => load(1), 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const b = await adminGetBooking(id);
      setDetail(b);
    } finally {
      setDetailLoading(false);
    }
  };

  const clearFilters = () => {
    setQ(""); setStatus(""); setPaymentStatus(""); setDateFrom(""); setDateTo("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý Bookings</h1>
      </div>

      {/* Filters Card */}
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Query */}
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Tìm kiếm</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Email, tên khách, tiêu đề tour, orderCode…"
              className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </label>

          {/* Booking status */}
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Trạng thái booking</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusOpt)}
              className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </label>

          {/* Payment status */}
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Thanh toán</span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PayStatusOpt)}
              className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="">Tất cả</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </label>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Từ ngày</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 rounded-lg border px-3"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Đến ngày</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 rounded-lg border px-3"
              />
            </label>
          </div>
        </div>

        {/* Active filters + reset */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {q || status || paymentStatus || dateFrom || dateTo ? (
            <>
              <span className="text-slate-500 mr-1">Bộ lọc:</span>
              {q && <span className="px-2 py-0.5 rounded-full bg-slate-100">{q}</span>}
              {status && <span className="px-2 py-0.5 rounded-full bg-slate-100">Booking: {status}</span>}
              {paymentStatus && <span className="px-2 py-0.5 rounded-full bg-slate-100">Pay: {paymentStatus}</span>}
              {dateFrom && <span className="px-2 py-0.5 rounded-full bg-slate-100">Từ {dateFrom}</span>}
              {dateTo && <span className="px-2 py-0.5 rounded-full bg-slate-100">Đến {dateTo}</span>}
              <button
                onClick={clearFilters}
                className="ml-auto text-slate-600 hover:text-slate-900 underline underline-offset-4"
              >
                Xoá tất cả
              </button>
            </>
          ) : (
            <span className="text-slate-500">Chọn bộ lọc để thu hẹp kết quả.</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[1040px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Ngày tạo</th>
              <th className="p-2 text-left">OrderCode</th>
              <th className="p-2 text-left">Khách</th>
              <th className="p-2 text-left">Tour</th>
              <th className="p-2 text-center">Khởi hành</th>
              <th className="p-2 text-right">SL</th>
              <th className="p-2 text-right">Tổng</th>
              <th className="p-2 text-center">Thanh toán</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <RowSkel /><RowSkel /><RowSkel />
              </>
            ) : items.length ? (
              items.map((b) => {
                // user display
                let userLabel = "—";
                if (typeof b.user === "string") userLabel = b.user;
                else if (b.user && typeof b.user === "object") userLabel = `${b.user.name ?? ""} <${b.user.email ?? ""}>`;
                const orderCode = b.payment?.intent_id || "—";

                return (
                  <tr key={b._id} className="border-t hover:bg-slate-50/40">
                    <td className="p-2">{fmtDate(b.createdAt)}</td>
                    <td className="p-2">{orderCode}</td>
                    <td className="p-2">{userLabel}</td>
                    <td className="p-2">{b.snapshot_title || b.tour_id}</td>
                    <td className="p-2 text-center">
                      {(b.start_date || b.start_time) ? `${b.start_date ?? ""} ${b.start_time ?? ""}`.trim() : "—"}
                    </td>
                    <td className="p-2 text-right">{b.qty}</td>
                    <td className="p-2 text-right">{fmtVND(b.total)}</td>
                    <td className="p-2 text-center">
                      {b.payment_status === "paid" && <Badge color="emerald">Đã thanh toán</Badge>}
                      {b.payment_status === "unpaid" && <Badge color="amber">Chưa thanh toán</Badge>}
                      {b.payment_status === "refunded" && <Badge color="sky">Đã hoàn tiền</Badge>}
                    </td>
                    <td className="p-2 text-center">
                      {b.status === "confirmed" && <Badge color="emerald">Đã xác nhận</Badge>}
                      {b.status === "pending" && <Badge color="amber">Chờ xử lý</Badge>}
                      {b.status === "cancelled" && <Badge color="rose">Đã huỷ</Badge>}
                    </td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        onClick={() => openDetail(b._id)}
                        className="px-2 py-1 rounded border cursor-pointer"
                      >
                        Chi tiết
                      </button>

                      {/* Bật khi muốn cho phép thao tác:
                      <button
                        onClick={async () => {
                          await adminUpdateBookingStatus(b._id, { status: "cancelled" });
                          await load(page);
                        }}
                        className="px-2 py-1 rounded border bg-rose-50 hover:bg-rose-100 cursor-pointer"
                      >
                        Huỷ
                      </button>
                      */}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center text-slate-500">
                  Không có booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Tổng <b>{total}</b> bản ghi • Trang {page}/{pages}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className={`px-3 py-1.5 rounded border ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
          >
            ← Trước
          </button>
          <button
            disabled={page >= pages}
            onClick={() => load(page + 1)}
            className={`px-3 py-1.5 rounded border ${page >= pages ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {detail !== null && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">Thông tin booking</div>
              <button className="h-8 w-8 grid place-items-center rounded hover:bg-slate-100" onClick={() => setDetail(null)}>×</button>
            </div>

            {detailLoading ? (
              <div className="p-6 text-slate-500">Đang tải…</div>
            ) : detail ? (
              <div className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Mã:</span> <b>{detail._id}</b></div>
                  <div><span className="text-slate-500">OrderCode:</span> <b>{detail.payment?.intent_id || "—"}</b></div>
                  <div><span className="text-slate-500">Khách:</span> <b>{typeof detail.user === "string" ? detail.user : `${detail.user?.name ?? ""} <${detail.user?.email ?? ""}>`}</b></div>
                  <div><span className="text-slate-500">Tạo lúc:</span> <b>{fmtDate(detail.createdAt)}</b></div>
                  <div><span className="text-slate-500">Tour:</span> <b>{detail.snapshot_title || detail.tour_id}</b></div>
                  <div><span className="text-slate-500">Khởi hành:</span> <b>{(detail.start_date || detail.start_time) ? `${detail.start_date ?? ""} ${detail.start_time ?? ""}`.trim() : "—"}</b></div>
                  <div><span className="text-slate-500">Số lượng:</span> <b>{detail.qty}</b></div>
                  <div><span className="text-slate-500">Tổng tiền:</span> <b>{fmtVND(detail.total)}</b></div>
                  <div><span className="text-slate-500">Thanh toán:</span> <b>{detail.payment_status}</b></div>
                  <div><span className="text-slate-500">Trạng thái:</span> <b>{detail.status}</b></div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Vé</div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 text-left">Mã vé</th>
                          <th className="p-2 text-left">Hành khách</th>
                          <th className="p-2 text-left">SĐT</th>
                          <th className="p-2 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.tickets?.length ? detail.tickets.map((t) => (
                          <tr key={t._id} className="border-t">
                            <td className="p-2 font-mono">{t.code}</td>
                            <td className="p-2">{t.passenger?.name ?? "—"}</td>
                            <td className="p-2">{t.passenger?.phone ?? "—"}</td>
                            <td className="p-2 text-center">
                              {t.status === "valid" && <Badge color="emerald">Còn hiệu lực</Badge>}
                              {t.status === "used" && <Badge color="gray">Đã dùng</Badge>}
                              {t.status === "void" && <Badge color="rose">Huỷ</Badge>}
                            </td>
                          </tr>
                        )) : (
                          <tr><td className="p-3 text-center text-slate-500" colSpan={4}>Chưa có vé</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="p-4 border-t flex justify-end">
              <button className="px-3 py-2 rounded border" onClick={() => setDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
