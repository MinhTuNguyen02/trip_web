import { useEffect, useMemo, useState } from "react";
import { listTours } from "../api/tours";
import { listDestinations } from "../api/destinations";
import type { Tour, Destination } from "../types";
import { AuthCtx } from "../contexts/AuthContext";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type RatingOption = 0 | 3 | 4 | 4.5;

export default function Tours() {
  // Data
  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters (UI state)
  const [destination, setDestination] = useState<string>("");
  const [departure, setDeparture] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [ratingMin, setRatingMin] = useState<RatingOption>(0);

  // Fetch destinations (1 lần)
  useEffect(() => {
    listDestinations().then(setDestinations).catch(() => {}).finally(() => {});
  }, []);

  // Fetch tours theo filters server-side (destination, price)
  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (destination) params.destination = destination;
    if (departure) params.departure = departure;
    if (minPrice.trim() !== "") params.minPrice = Number(minPrice);
    if (maxPrice.trim() !== "") params.maxPrice = Number(maxPrice);

    listTours(params)
      .then(setTours)
      .finally(() => setLoading(false));
  }, [destination, departure, minPrice, maxPrice]);

  // Map destination id -> name
  const destName = useMemo(() => {
    const m: Record<string, string> = {};
    destinations.forEach((d) => (m[d._id] = (d as any).name ?? ""));
    return m;
  }, [destinations]);

  // Rating filter (client-side)
  const visibleTours = useMemo(() => {
    if (!ratingMin) return tours;
    return tours.filter((t) => (t.rating_avg ?? 0) >= ratingMin);
  }, [tours, ratingMin]);

  return (
    <div className="relative">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-rose-200/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters Card */}
        <div className="mb-6 rounded-2xl border bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
    {/* Điểm đi */}
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-600">Điểm đi</span>
      <select
        value={departure}
        onChange={(e) => setDeparture(e.target.value)}
        className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="">Tất cả</option>
        {destinations.map((d) => (
          <option key={d._id} value={d._id}>{(d as any).name}</option>
        ))}
      </select>
    </label>

    {/* Điểm đến */}
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-600">Điểm đến</span>
      <select
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="">Tất cả</option>
        {destinations.map((d) => (
          <option key={d._id} value={d._id}>{(d as any).name}</option>
        ))}
      </select>
    </label>

    {/* Giá từ */}
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-600">Giá từ</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={minPrice ? Number(minPrice).toLocaleString("vi-VN") : ""}
          onChange={(e) => setMinPrice(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="0"
          className="w-full h-10 rounded-lg border pl-7 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        {minPrice && (
          <button
            type="button"
            onClick={() => setMinPrice("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded hover:bg-slate-100 text-slate-500"
            aria-label="Xoá giá từ"
          >×</button>
        )}
      </div>
    </label>

    {/* Giá đến */}
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-600">Đến</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={maxPrice ? Number(maxPrice).toLocaleString("vi-VN") : ""}
          onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="—"
          className="w-full h-10 rounded-lg border pl-7 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        {maxPrice && (
          <button
            type="button"
            onClick={() => setMaxPrice("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded hover:bg-slate-100 text-slate-500"
            aria-label="Xoá giá đến"
          >×</button>
        )}
      </div>
    </label>

    {/* Đánh giá tối thiểu */}
    <label className="space-y-1">
      <span className="text-xs font-medium text-slate-600">Đánh giá tối thiểu</span>
      <select
        value={String(ratingMin)}
        onChange={(e) => setRatingMin(Number(e.target.value) as RatingOption)}
        className="w-full h-10 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="0">Tất cả</option>
        <option value="3">≥ 3.0★</option>
        <option value="4">≥ 4.0★</option>
        <option value="4.5">≥ 4.5★</option>
      </select>
    </label>
  </div>

  {/* Active filters + reset */}
  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
    {(destination || departure || minPrice || maxPrice || ratingMin) ? (
      <>
        <span className="text-slate-500 mr-1">Bộ lọc:</span>
        {departure && <Chip onClear={() => setDeparture("")}>Từ {destName[departure] || "Điểm đi"}</Chip>}
        {destination && <Chip onClear={() => setDestination("")}>Đến {destName[destination] || "Điểm đến"}</Chip>}
        {minPrice && <Chip onClear={() => setMinPrice("")}>Từ {Number(minPrice).toLocaleString("vi-VN")}đ</Chip>}
        {maxPrice && <Chip onClear={() => setMaxPrice("")}>Đến {Number(maxPrice).toLocaleString("vi-VN")}đ</Chip>}
        {ratingMin ? <Chip onClear={() => setRatingMin(0)}>≥ {ratingMin}★</Chip> : null}
        <button
          onClick={() => {
            setDestination("");
            setDeparture("");
            setMinPrice("");
            setMaxPrice("");
            setRatingMin(0);
          }}
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


        {/* Content */}
        {loading ? (
          <GridSkeleton />
        ) : visibleTours.length ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTours.map((t) => (
              <TourCard key={t._id} tour={t} destinationName={destName[t.destination_id]} departureName={destName[t.departure_id]}/>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white/70 backdrop-blur p-8 text-center text-slate-600">
            Không tìm thấy tour phù hợp. Hãy điều chỉnh bộ lọc và thử lại.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

// thay TourCard trong trang list
import { Link } from "react-router-dom";
import OptionPicker from "../components/OptionPicker";

function TourCard({ tour, destinationName, departureName }: { tour: Tour; destinationName?: string; departureName?: string }) {
  const cover = tour.images?.[0];
  const [openPicker, setOpenPicker] = useState(false);
  const { user } = useContext(AuthCtx);
  const navigate = useNavigate();
  const location = useLocation();

  function handleClickAdd() {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setOpenPicker(true);
  }

  return (
    <div className="group rounded-2xl border bg-white/80 backdrop-blur overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/tours/${tour._id}`} className="block relative h-44 w-full bg-slate-100">
        {cover ? (
          <img src={cover} alt={tour.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-slate-400 text-sm">No image</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            tour.is_active ? "bg-emerald-600 text-white" : "bg-slate-500 text-white"
          }`}>
            {tour.is_active ? "Đang bán" : "Tạm ẩn"}
          </span>
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/tours/${tour._id}`} className="font-semibold leading-snug hover:underline">
            [{departureName} - {destinationName}] {tour.title}
          </Link>
          <div className="text-right shrink-0">
            <div className="text-rose-600 font-bold">
              {tour.price.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-xs text-slate-500">/người</div>
          </div>
        </div>

        {destinationName && (
          <div className="text-sm text-slate-600">{destinationName}</div>
        )}

        <div className="text-sm text-slate-600 line-clamp-2">{tour.summary}</div>
        <div className="flex items-center justify-between text-sm pt-1">
          <div className="text-slate-600">{tour.duration_hr} giờ</div>
          <StarRating rating={tour.rating_avg ?? 0} />
        </div>
        <button
          onClick={handleClickAdd}
          className="w-full mt-2 h-10 rounded-lg bg-slate-900 text-white hover:opacity-90 transition cursor-pointer"
        >
          Thêm vào giỏ
        </button>
      </div>

      <OptionPicker
        tourId={tour._id}
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        onAdded={() => setOpenPicker(false)}
      />
    </div>
  );
}


function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const items = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "full";
    if (i === full && half) return "half";
    return "empty";
  });
  return (
    <div className="flex items-center gap-0.5">
      {items.map((t, i) => (
        <span key={i} aria-hidden className={
          t === "full"
            ? "text-amber-500"
            : t === "half"
            ? "text-amber-500 opacity-60"
            : "text-slate-300"
        }>
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear(): void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100">
      {children}
      <button
        type="button"
        onClick={onClear}
        className="text-slate-500 hover:text-slate-900"
        aria-label="Xoá"
      >
        ×
      </button>
    </span>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white/80 overflow-hidden">
          <div className="h-44 bg-slate-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
            <div className="h-10 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
