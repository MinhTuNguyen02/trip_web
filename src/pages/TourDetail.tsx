// src/pages/TourDetail.tsx
import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { getTour, listTours } from "../api/tours";
import { listDestinations } from "../api/destinations";
import type { Tour, Destination } from "../types";
import OptionPicker from "../components/OptionPicker";

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
        setRelated(rs.filter(r => r._id !== id));
      }
    })();
  }, [id]);

  const destName = useMemo(() => {
    const m: Record<string, string> = {};
    dests.forEach((d) => (m[d._id] = (d as any).name ?? ""));
    return m;
  }, [dests]);

  if (!tour) return <div className="max-w-5xl mx-auto p-6">Đang tải tour…</div>;

  const cover = tour.images?.[0];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden border bg-slate-100">
          {cover ? <img src={cover} alt={tour.title} className="w-full h-72 object-cover" /> : <div className="h-72 grid place-items-center text-slate-400">No image</div>}
          {tour.images?.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {tour.images.slice(1, 5).map((u) => (
                <img key={u} src={u} className="h-20 w-full object-cover rounded-lg border" />
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="text-sm text-slate-500">{destName[tour.destination_id] || "—"}</div>
          <h1 className="text-2xl font-bold">{tour.title}</h1>
          <div className="text-slate-700">{tour.summary}</div>
          <div className="flex items-baseline gap-2">
            <div className="text-rose-600 text-2xl font-bold">{tour.price.toLocaleString("vi-VN")} đ</div>
            <span className="text-sm text-slate-500">/người • {tour.duration_hr} giờ</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setOpenPicker(true)}
              className="px-4 h-11 rounded-lg bg-slate-900 text-white hover:opacity-90"
            >
              Chọn lịch & thêm vào giỏ
            </button>
          </div>

          {tour.policy ? (
            <div className="text-xs text-slate-500 pt-2">
              Chính sách: {tour.policy}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mô tả chi tiết */}
      {tour.description ? (
        <section className="rounded-2xl border p-5 bg-white space-y-2">
          <div className="text-lg font-semibold">Mô tả chi tiết</div>
          <div className="prose prose-sm max-w-none">{tour.description}</div>
        </section>
      ) : null}

      {/* Tour liên quan */}
      {related.length ? (
        <section className="space-y-3">
          <div className="text-lg font-semibold">Tours liên quan</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r._id} to={`/tours/${r._id}`} className="rounded-xl border overflow-hidden bg-white hover:shadow">
                <img src={r.images?.[0]} className="h-36 w-full object-cover bg-slate-100" />
                <div className="p-3">
                  <div className="font-medium line-clamp-1">{r.title}</div>
                  <div className="text-sm text-slate-600 line-clamp-2">{r.summary}</div>
                  <div className="text-rose-600 font-semibold mt-1">{r.price.toLocaleString("vi-VN")} đ</div>
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
      />
    </div>
  );
}
