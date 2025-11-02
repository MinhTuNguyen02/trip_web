/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/TourDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTour, listTours } from "../api/tours";
import { listDestinations } from "../api/destinations";
import type { Tour, Destination } from "../types";
import OptionPicker from "../components/OptionPicker";

/**
 * Hiển thị chi tiết tour:
 * - Tiêu đề: [Điểm đi - Điểm đến] Tên tour
 * - Ảnh cover + thumbnails
 * - Thông tin tổng quan (giá, thời lượng, đánh giá, trạng thái, chính sách)
 * - Mô tả chi tiết
 * - Tours liên quan (cùng destination)
 */
export default function TourDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [dests, setDests] = useState<Destination[]>([]);
  const [related, setRelated] = useState<Tour[]>([]);
  const [openPicker, setOpenPicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const t = await getTour(id);
      setTour(t);
      const ds = await listDestinations();
      setDests(ds);
      if (t?.destination_id) {
        const rs = await listTours({ destination: t.destination_id, limit: 6 });
        setRelated(rs.filter((r) => r._id !== id));
      }
    })();
  }, [id]);

  // Map id -> tên (điểm đi/điểm đến)
  const destName = useMemo(() => {
    const m: Record<string, string> = {};
    dests.forEach((d) => (m[d._id] = (d as any).name ?? ""));
    return m;
  }, [dests]);

  if (!tour) return <div className="max-w-6xl mx-auto p-6">Đang tải tour…</div>;

  const cover = tour.images?.[0];
  const depName = destName[tour.departure_id] || "—";
  const desName = destName[tour.destination_id] || "—";
  const rating = tour.rating_avg ?? 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header / Hero */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gallery */}
        <div className="rounded-2xl overflow-hidden border bg-slate-100">
          {cover ? (
            <img
              src={cover}
              alt={tour.title}
              className="w-full h-80 object-cover"
            />
          ) : (
            <div className="h-80 grid place-items-center text-slate-400">
              No image
            </div>
          )}
          {tour.images?.length ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {tour.images.slice(0, 8).map((u, i) => (
                <img
                  key={u + i}
                  src={u}
                  className="h-20 w-full object-cover rounded-lg border bg-white"
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Summary card */}
        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            {depName} → {desName}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            [{depName} – {desName}] {tour.title}
          </h1>

          {tour.summary ? (
            <p className="text-slate-700">{tour.summary}</p>
          ) : null}

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-rose-600 text-3xl font-extrabold">
                {tour.price.toLocaleString("vi-VN")} đ
              </div>
              <div className="text-xs text-slate-500">/người</div>
            </div>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border bg-white">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-sm text-slate-700">
                {tour.duration_hr} giờ
              </span>
            </div>

            <RatingPill rating={rating} />

            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                tour.is_active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 border"
              }`}
              title="Trạng thái hiển thị"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  tour.is_active ? "bg-emerald-600" : "bg-slate-500"
                }`}
              />
              {tour.is_active ? "Đang bán" : "Tạm ẩn"}
            </span>
          </div>

          {tour.policy ? (
            <div className="text-sm text-slate-600 leading-relaxed">
              <span className="font-medium">Chính sách:</span> {tour.policy}
            </div>
          ) : null}

          <div className="pt-2">
            <button
              onClick={() => setOpenPicker(true)}
              className="px-5 h-11 rounded-lg bg-slate-900 text-white hover:opacity-90"
            >
              Chọn lịch & thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="text-lg font-semibold">Thông tin chi tiết</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <InfoItem label="Điểm đi" value={depName} />
          <InfoItem label="Điểm đến" value={desName} />
          <InfoItem
            label="Thời lượng"
            value={`${tour.duration_hr?.toString() ?? "-"} giờ`}
          />
          <InfoItem
            label="Giá"
            value={`${tour.price.toLocaleString("vi-VN")} đ / người`}
          />
          <InfoItem
            label="Đánh giá"
            value={`${rating.toFixed(1)} ★`}
          />
          <InfoItem
            label="Trạng thái"
            value={tour.is_active ? "Đang bán" : "Tạm ẩn"}
          />
        </div>

        {tour.description ? (
          <div className="prose prose-sm max-w-none mt-2">
            {tour.description}
          </div>
        ) : null}
      </section>

      {/* Tours liên quan */}
      {related.length ? (
        <section className="space-y-3">
          <div className="text-lg font-semibold">Tours liên quan</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r._id}
                to={`/tours/${r._id}`}
                className="rounded-xl border overflow-hidden bg-white hover:shadow transition"
              >
                <img
                  src={r.images?.[0]}
                  className="h-36 w-full object-cover bg-slate-100"
                />
                <div className="p-3">
                  <div className="font-medium line-clamp-1">
                    [{destName[r.departure_id] || "—"} – {destName[r.destination_id] || "—"}] {r.title}
                  </div>
                  <div className="text-sm text-slate-600 line-clamp-2">
                    {r.summary}
                  </div>
                  <div className="text-rose-600 font-semibold mt-1">
                    {r.price.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Modal chọn lịch */}
      <OptionPicker
        tourId={tour._id}
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        is_active={tour.is_active}
      />
    </div>
  );
}

/* ---------------- Components ---------------- */

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-800 truncate">
        {value || "—"}
      </div>
    </div>
  );
}

function RatingPill({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "full";
    if (i === full && half) return "half";
    return "empty";
  });
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-white text-sm">
      <span className="flex items-center">
        {stars.map((t, i) => (
          <span
            key={i}
            className={
              t === "full"
                ? "text-amber-500"
                : t === "half"
                ? "text-amber-500 opacity-60"
                : "text-slate-300"
            }
            aria-hidden
          >
            ★
          </span>
        ))}
      </span>
      <span className="ml-1 text-slate-700">{rating.toFixed(1)}</span>
    </span>
  );
}
