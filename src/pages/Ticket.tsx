// src/Ticket.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { listMyTickets, getMyTicket } from "../api/tickets";
import { createPortal } from "react-dom";

// (optional) QR generator dùng thư viện "qrcode"
// npm i qrcode
let QR: any = null;
(async () => {
  try {
    QR = await import("qrcode");
  } catch {
    // không sao, fallback text
  }
})();

type Row = Awaited<ReturnType<typeof listMyTickets>>["rows"][number];

export default function TicketsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // filters
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // detail modal
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMyTickets({ page, limit, status, q });
      setRows(data.rows);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await load();
  };

  const openDetail = async (id: string) => {
    setDetail(null);
    setDetailLoading(true);
    setOpenId(id);
    try {
      const data = await getMyTicket(id);
      setDetail(data);
    } finally {
      setDetailLoading(false);
    }
  };

  // const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString("vi-VN") : "-");
  const badge = (st: Row["status"]) => {
    const map: Record<string, string> = {
      valid: "bg-emerald-50 text-emerald-700",
      used: "bg-blue-50 text-blue-700",
      refunded: "bg-amber-50 text-amber-700",
      void: "bg-slate-100 text-slate-600",
    };
    const label: Record<string, string> = {
      valid: "Hợp lệ",
      used: "Đã dùng",
      refunded: "Hoàn tiền",
      void: "Voided",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${map[st] || "bg-slate-100 text-slate-600"}`}>
        {label[st] || st}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Vé của tôi</h1>
      </div>

      {/* Filters */}
      <form onSubmit={onSearch} className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã vé / tên / điện thoại"
            className="w-full h-10 rounded-lg border px-3"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-10 rounded-lg border px-3"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="valid">Hợp lệ</option>
            <option value="used">Đã dùng</option>
            <option value="refunded">Hoàn tiền</option>
            <option value="void">Voided</option>
          </select>
          <button className="h-10 rounded-lg border bg-slate-50 hover:bg-slate-100">
            Áp dụng
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl bg-white">
        {loading ? (
          <div className="p-6 text-slate-500">Đang tải vé…</div>
        ) : rows.length ? (
          <table className="min-w-[920px] w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 text-left">Mã vé</th>
                <th className="p-2 text-left">Khách</th>
                <th className="p-2 text-left">Tour</th>
                <th className="p-2 text-left">Điểm đến</th>
                <th className="p-2 text-left">Khởi hành</th>
                <th className="p-2 text-center">Trạng thái</th>
                <th className="p-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t._id} className="border-t hover:bg-slate-50/40">
                  <td className="p-2 font-mono">{t.code}</td>
                  <td className="p-2">
                    {t.passenger?.name || "-"}
                    <div className="text-xs text-slate-500">
                      {t.passenger?.phone || ""}
                    </div>
                  </td>
                  <td className="p-2">
                    {t.booking?.snapshot_title || "(Tour)"}
                  </td>
                  <td className="p-2">
                    {t.booking?.snapshot_destination_name || "-"}
                  </td>
                  <td className="p-2">
                    {t.booking?.start_date
                      ? new Date(t.booking.start_date).toLocaleDateString("vi-VN")
                      : "-"}
                    {t.booking?.start_time ? ` ${t.booking.start_time}` : ""}
                  </td>
                  <td className="p-2 text-center">{badge(t.status)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => openDetail(t._id)}
                      className="px-2 py-1 rounded border cursor-pointer"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-slate-500">Bạn chưa có vé nào.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Trước
          </button>
          <div className="text-sm text-slate-600">
            Trang {page}/{totalPages}
          </div>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {openId &&
        createPortal(
          <DetailModal
            loading={detailLoading}
            data={detail}
            onClose={() => setOpenId(null)}
          />,
          document.body
        )}
    </div>
  );
}

function DetailModal({
  data,
  loading,
  onClose,
}: {
  data: Row | null;
  loading: boolean;
  onClose(): void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!data?.qr_payload || !QR) return setQrDataUrl("");
      try {
        const url = await QR.toDataURL(data.qr_payload, { margin: 1, width: 240 });
        setQrDataUrl(url);
      } catch {
        setQrDataUrl("");
      }
    })();
  }, [data]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Đã sao chép");
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 p-4 md:p-6 grid place-items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <div className="font-semibold">Chi tiết vé</div>
            <button
              onClick={onClose}
              className="h-9 w-9 grid place-items-center rounded-full border hover:bg-slate-50 cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="p-5 grid md:grid-cols-2 gap-5">
            {/* QR & code */}
            <div className="space-y-3">
              <div className="rounded-lg border p-3 grid place-items-center">
                {loading ? (
                  <div className="text-slate-500">Đang tải QR…</div>
                ) : qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR" className="w-48 h-48" />
                ) : (
                  <div className="text-slate-500 text-sm">
                    Không tạo được QR. Mã:{" "}
                    <span className="font-mono">{data?.code}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm bg-slate-50 border rounded px-2 py-1">
                  {data?.code}
                </div>
                {data?.code && (
                  <button
                    onClick={() => copy(data.code!)}
                    className="px-2 py-1 rounded border hover:bg-slate-50 cursor-pointer"
                  >
                    Copy mã
                  </button>
                )}
              </div>
              {data?.pickup_note && (
                <div className="text-sm text-slate-700">
                  <div className="font-medium mb-1">Hướng dẫn đón khách</div>
                  <div className="rounded-lg border bg-slate-50 p-3">{data.pickup_note}</div>
                </div>
              )}
            </div>

            {/* Booking info */}
            <div className="space-y-2 text-sm">
              <InfoRow label="Tour" value={data?.booking?.snapshot_title || "-"} />
              <InfoRow label="Điểm đến" value={data?.booking?.snapshot_destination_name || "-"} />
              <InfoRow
                label="Khởi hành"
                value={
                  data?.booking?.start_date
                    ? new Date(data.booking.start_date).toLocaleString("vi-VN") +
                      (data.booking.start_time ? ` ${data.booking.start_time}` : "")
                    : "-"
                }
              />
              <InfoRow label="Hành khách" value={data?.passenger?.name || "-"} />
              <InfoRow label="SĐT" value={data?.passenger?.phone || "-"} />
              <InfoRow label="Địa chỉ" value={data?.passenger?.address || "-"} />
              <InfoRow label="Trạng thái" value={<StatusBadge s={data?.status} />} />
              <InfoRow
                label="Thời điểm dùng"
                value={data?.used_at ? new Date(data.used_at).toLocaleString("vi-VN") : "-"}
              />
              <InfoRow label="Tạo lúc" value={data?.createdAt ? new Date(data.createdAt).toLocaleString("vi-VN") : "-"} />              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-36 text-slate-500">{label}</div>
      <div className="flex-1">{typeof value === "string" ? value : value ?? "-"}</div>
    </div>
  );
}

function StatusBadge({ s }: { s?: Row["status"] }) {
  if (!s) return <>-</>;
  const map: Record<string, string> = {
    valid: "bg-emerald-50 text-emerald-700",
    used: "bg-blue-50 text-blue-700",
    refunded: "bg-amber-50 text-amber-700",
    void: "bg-slate-100 text-slate-600",
  };
  const label: Record<string, string> = {
    valid: "Hợp lệ",
    used: "Đã dùng",
    refunded: "Hoàn tiền",
    void: "Voided",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${map[s] || "bg-slate-100 text-slate-600"}`}>
      {label[s] || s}
    </span>
  );
}
