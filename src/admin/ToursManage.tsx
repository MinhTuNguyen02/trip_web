import { useEffect, useMemo, useState } from "react";
import { listTours } from "../api/tours";
import { listDestinations } from "../api/destinations";
import { listPOIs } from "../api/pois";
import type { Tour, Destination, POI } from "../types";
import {
  adminCreateTour,
  adminUpdateTour,
  adminDeleteTour,
  adminToggleTourActive,
} from "../api/admin";
import { api } from "../api/http";
import "react-time-picker/dist/TimePicker.css";
// + NEW imports
import type { TourOption } from "../types";
import {
  listTourOptions,
  adminCreateTourOption,
  adminUpdateTourOption,
  adminDeleteTourOption,
  adminUpdateTourOptionStatus,
} from "../api/tourOption";
import { createPortal } from "react-dom";

type RatingOption = 0 | 3 | 4 | 4.5;

export default function ToursManage() {
  // ---------------- Data ----------------
  const [tours, setTours] = useState<Tour[]>([]);
  const [dests, setDests] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tour | null>(null);

  // ---------------- Filters ----------------
  const [destination, setDestination] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [ratingMin, setRatingMin] = useState<RatingOption>(0);

  const reload = async () => {
    setLoading(true);
    const params: any = {};
    if (destination) params.destination = destination;
    if (minPrice.trim() !== "") params.minPrice = Number(minPrice);
    if (maxPrice.trim() !== "") params.maxPrice = Number(maxPrice);
    const [t, d] = await Promise.all([listTours(params), listDestinations()]);
    setTours(t);
    setDests(d);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [destination, minPrice, maxPrice]);

  const destMap = useMemo(
    () =>
      dests.reduce<Record<string, string>>((m, d) => {
        m[d._id] = (d as any).name ?? "";
        return m;
      }, {}),
    [dests]
  );

  // Rating filter (client-side)
  const visibleTours = useMemo(() => {
    if (!ratingMin) return tours;
    return tours.filter((t) => (t.rating_avg ?? 0) >= ratingMin);
  }, [tours, ratingMin]);

  if (loading) return <div className="p-6">Đang tải dữ liệu…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý Tours</h1>
        <button
          onClick={() => setEditing({} as any)}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white cursor-pointer"
        >
          + Thêm tour
        </button>
      </div>

      {/* ---------------- Filters Card ---------------- */}
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Destination */}
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Điểm đến</span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-10 rounded-lg border px-3"
            >
              <option value="">Tất cả</option>
              {dests.map((d) => (
                <option key={d._id} value={d._id}>
                  {(d as any).name}
                </option>
              ))}
            </select>
          </label>

          {/* Min price */}
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Giá từ (VND)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value.replace(/[^\d]/g, ""))
              }
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          {/* Max price */}
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Đến (VND)</span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value.replace(/[^\d]/g, ""))
              }
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          {/* Rating */}
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Đánh giá tối thiểu</span>
            <select
              value={String(ratingMin)}
              onChange={(e) =>
                setRatingMin(Number(e.target.value) as RatingOption)
              }
              className="w-full h-10 rounded-lg border px-3"
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
          {(destination || minPrice || maxPrice || ratingMin) ? (
            <>
              <span className="text-slate-500 mr-1">Bộ lọc đang áp dụng:</span>
              {destination && (
                <Chip onClear={() => setDestination("")}>
                  {destMap[destination] || "Điểm đến"}
                </Chip>
              )}
              {minPrice && (
                <Chip onClear={() => setMinPrice("")}>
                  Từ {Number(minPrice).toLocaleString("vi-VN")}đ
                </Chip>
              )}
              {maxPrice && (
                <Chip onClear={() => setMaxPrice("")}>
                  Đến {Number(maxPrice).toLocaleString("vi-VN")}đ
                </Chip>
              )}
              {ratingMin ? (
                <Chip onClear={() => setRatingMin(0)}>≥ {ratingMin}★</Chip>
              ) : null}
              <button
                onClick={() => {
                  setDestination("");
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
            <span className="text-slate-500">
              Chọn bộ lọc để thu hẹp kết quả.
            </span>
          )}
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Tiêu đề</th>
              <th className="p-2 text-left">Điểm đến</th>
              <th className="p-2 text-right">Giá</th>
              <th className="p-2 text-center">Đánh giá</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visibleTours.map((t) => (
              <tr key={t._id} className="border-t hover:bg-slate-50/40">
                <td className="p-2 font-medium">{t.title}</td>
                <td className="p-2">{destMap[t.destination_id] || t.destination_id}</td>
                <td className="p-2 text-right">
                  {t.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="p-2 text-center">{t.rating_avg?.toFixed(1) ?? "-"}</td>
                <td className="p-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      t.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        t.is_active ? "bg-emerald-600" : "bg-slate-400"
                      }`}
                    />
                    {t.is_active ? "Đang bán" : "Tạm ẩn"}
                  </span>
                </td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => setEditing(t)}
                    className="px-2 py-1 rounded border cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={async () => {
                      const updated = await adminToggleTourActive(t._id, !t.is_active);
                      setTours((prev) =>
                        prev.map((x) => (x._id === updated._id ? updated : x))
                      );
                    }}
                    className="px-2 py-1 rounded border bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    {t.is_active ? "Tắt" : "Bật"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Xóa tour "${t.title}"?`)) return;
                      await adminDeleteTour(t._id);
                      await reload();
                    }}
                    className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {!visibleTours.length && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Không có tour phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Form Popup ---------------- */}
      {editing && (
        <TourForm
          dests={dests}
          initial={editing._id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            if (editing?._id) await adminUpdateTour(editing._id, data);
            else await adminCreateTour(data);
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

/* ------------ Helper components ------------- */
function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear(): void;
}) {
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

function TourForm({
  dests,
  initial,
  onClose,
  onSubmit,
}: {
  dests: Destination[];
  initial?: Partial<Tour>;
  onClose(): void;
  onSubmit(data: Partial<Tour>): Promise<void>;
}) {
  const [preview, setPreview] = useState<string[]>(initial?.images || []);

  // --- NEW: POIs theo destination ---
  const [selectedDest, setSelectedDest] = useState<string>(String(initial?.destination_id || ""));
  const [poiOptions, setPoiOptions] = useState<POI[]>([]);
  const [poiSelected, setPoiSelected] = useState<string[]>(
    (initial as any)?.poi_ids || []
  );
  const [poiSearch, setPoiSearch] = useState("");

  async function loadPOIs(destId?: string) {
    if (!destId) {
      setPoiOptions([]);
      setPoiSelected([]);
      return;
    }
    const list = await listPOIs({ destination: destId });
    setPoiOptions(list);
    // lọc lại những poi đã chọn mà vẫn còn trong dest mới
    setPoiSelected((curr) => curr.filter((id) => list.some((p) => p._id === id)));
  }

  useEffect(() => {
    loadPOIs(selectedDest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDest]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<{ url: string }>("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setPreview((p) => [...p, data.url]);
  }

  const removeImage = (url: string) => setPreview((p) => p.filter((x) => x !== url));

  const filteredPOIs = poiOptions.filter((p) =>
    !poiSearch.trim()
      ? true
      : p.name.toLowerCase().includes(poiSearch.toLowerCase())
  );

  // ... các state cũ
  const tourId = String(initial?._id || ""); // tour đang edit

  // --- TOUR OPTIONS state ---
  const [opts, setOpts] = useState<TourOption[]>([]);
  const [optsLoading, setOptsLoading] = useState<boolean>(!!tourId);
  const [optEditorOpen, setOptEditorOpen] = useState<boolean>(false);
  const [editingOpt, setEditingOpt] = useState<TourOption | null>(null);

  const loadOptions = async () => {
    if (!tourId) return;
    setOptsLoading(true);
    const list = await listTourOptions(tourId);
    setOpts(list);
    setOptsLoading(false);
  };

  useEffect(() => {
    if (tourId) loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const is_active = f.get("is_active") !== null;
          const data: Partial<Tour> = {
            destination_id: String(f.get("destination_id")),
            title: String(f.get("title")),
            summary: String(f.get("summary") || ""),
            description: String(f.get("description") || ""),
            price: Number(f.get("price") || 0),
            duration_hr: Number(f.get("duration_hr") || 0),
            images: preview,
            policy: String(f.get("policy") || ""),
            is_active,
            // NEW:
            poi_ids: poiSelected,
          };
          await onSubmit(data);
        }}
        className="
          relative w-full max-w-4xl
          bg-white rounded-2xl shadow-2xl
          flex flex-col
          max-h-[90vh]
        "
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b bg-white">
          <h3 className="text-lg md:text-xl font-semibold">
            {initial?._id ? "Sửa tour" : "Thêm tour"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-full border hover:bg-slate-50 cursor-pointer"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-6 overflow-y-auto">
          {/* Thông tin cơ bản */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Thông tin cơ bản</div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Điểm đến</span>
                <select
                  name="destination_id"
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                >
                  <option value="">-- Chọn điểm đến --</option>
                  {dests.map((d) => (
                    <option key={d._id} value={d._id}>
                      {(d as any).name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Tiêu đề</span>
                <input
                  name="title"
                  defaultValue={initial?.title}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                  placeholder="VD: Ninh Bình – Hang Múa & Tràng An"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Tóm tắt</span>
                <input
                  name="summary"
                  defaultValue={initial?.summary}
                  className="w-full border rounded-lg h-10 px-3"
                  placeholder="Một câu mô tả ngắn"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Mô tả chi tiết</span>
                <textarea
                  name="description"
                  defaultValue={(initial as any)?.description}
                  className="w-full border rounded-lg px-3 py-2 min-h-[88px]"
                  placeholder="Nội dung mô tả tour…"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Giá (VND)</span>
                <input
                  name="price"
                  type="number"
                  min={0}
                  defaultValue={initial?.price}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Thời lượng (giờ)</span>
                <input
                  name="duration_hr"
                  type="number"
                  min={1}
                  defaultValue={initial?.duration_hr}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>
            </div>
          </section>

          {/* --- TOUR OPTIONS --- */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">Lịch khởi hành (Tour Options)</div>

              {tourId ? (
                <button
                  type="button"
                  onClick={() => { setEditingOpt(null); setOptEditorOpen(true); }}
                  className="px-3 py-2 rounded-lg border hover:bg-slate-50 cursor-pointer"
                >
                  + Thêm lịch
                </button>
              ) : (
                <span className="text-sm text-slate-500">Lưu tour trước để tạo lịch khởi hành.</span>
              )}
            </div>

            {!tourId ? null : optsLoading ? (
              <div className="text-sm text-slate-500">Đang tải…</div>
            ) : !opts.length ? (
              <div className="text-sm text-slate-500">Chưa có lịch nào.</div>
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-[780px] w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">Ngày</th>
                      <th className="p-2 text-left">Giờ</th>
                      <th className="p-2 text-center">Sức chứa</th>
                      <th className="p-2 text-center">Còn</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 w-40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {opts.map(o => (
                      <tr key={o._id} className="border-t">
                        <td className="p-2">{o.start_date?.slice(0,10)}</td>
                        <td className="p-2">{o.start_time || "-"}</td>
                        <td className="p-2 text-center">{o.capacity_sold}/{o.capacity_total}</td>
                        <td className="p-2 text-center">{o.remaining ?? Math.max(0, o.capacity_total - o.capacity_sold)}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            o.status === "open" ? "bg-emerald-50 text-emerald-700"
                            : o.status === "full" ? "bg-amber-50 text-amber-700"
                            : o.status === "closed" ? "bg-slate-100 text-slate-600"
                            : "bg-rose-50 text-rose-700"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-2 text-right ">
                          <button
                            type="button"
                            className="px-2 py-1 rounded border cursor-pointer"
                            onClick={() => { setEditingOpt(o); setOptEditorOpen(true); }}
                          >Sửa</button>

                          <button
                            type="button"
                            className="px-2 py-1 rounded border bg-slate-50 hover:bg-slate-100 cursor-pointer"
                            onClick={async () => {
                              const next = o.status === "open" ? "closed" : "open";
                              const updated = await adminUpdateTourOptionStatus(o._id, next as any);
                              setOpts(prev => prev.map(x => x._id === o._id ? updated : x));
                            }}
                          >
                            {o.status === "open" ? "Đóng" : "Mở"}
                          </button>

                          <button
                            type="button"
                            className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            onClick={async () => {
                              if (!confirm("Xoá lịch này?")) return;
                              await adminDeleteTourOption(o._id);
                              await loadOptions();
                            }}
                          >Xoá</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal editor cho TourOption */}
            {optEditorOpen && tourId && createPortal(
              <OptionEditor
                tourId={tourId}
                initial={editingOpt || undefined}
                onClose={() => setOptEditorOpen(false)}
                onSaved={async () => { setOptEditorOpen(false); await loadOptions(); }}
              />,
              document.body
            )}
          </section>


          {/* POIs */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">Điểm dừng (POI) trong tour</div>
              <input
                value={poiSearch}
                onChange={(e) => setPoiSearch(e.target.value)}
                placeholder="Tìm POI…"
                className="border rounded-lg h-9 px-3 text-sm"
                style={{ width: 220 }}
                disabled={!selectedDest}
              />
            </div>

            {!selectedDest ? (
              <div className="text-sm text-slate-500">Hãy chọn Điểm đến để xem POI.</div>
            ) : filteredPOIs.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredPOIs.map((p) => {
                  const checked = poiSelected.includes(p._id);
                  return (
                    <label
                      key={p._id}
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                        checked ? "bg-emerald-50 border-emerald-200" : "bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setPoiSelected((curr) =>
                            e.target.checked
                              ? [...curr, p._id]
                              : curr.filter((id) => id !== p._id)
                          );
                        }}
                      />
                      <div className="truncate">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 truncate">{p.type}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Không có POI phù hợp.</div>
            )}
          </section>

          {/* Ảnh */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Ảnh tour</div>
            <input type="file" accept="image/*" onChange={handleUpload} />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {preview.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    title="Xoá ảnh"
                    className="absolute -top-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-black/70 text-white cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Chính sách & hiển thị */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Chính sách & hiển thị</div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Chính sách hủy/đổi</span>
                <textarea
                  name="policy"
                  defaultValue={(initial as any)?.policy}
                  className="w-full border rounded-lg px-3 py-2 min-h-[72px]"
                  placeholder="Ví dụ: Không hoàn huỷ trong ngày khởi hành."
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={initial?._id ? !!initial?.is_active : true}
                />
                Hiển thị tour (is_active)
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-3 border-t bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-lg border hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button className="px-4 h-10 rounded-lg bg-slate-900 text-white hover:opacity-90 cursor-pointer">
            {initial?._id ? "Lưu" : "Tạo"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OptionEditor({
  tourId,
  initial,
  onClose,
  onSaved,
}: {
  tourId: string;
  initial?: TourOption;
  onClose(): void;
  onSaved(): void;
}) {
  // chặn scroll nền khi mở modal (optional, UX tốt hơn)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* form của modal NẰM NGOÀI form TourForm nhờ portal */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const payload = {
            tour_id: tourId,
            start_date: String(f.get("start_date")),        // YYYY-MM-DD
            start_time: String(f.get("start_time") || ""),  // HH:mm | ""
            capacity_total: Number(f.get("capacity_total") || 1),
            cut_off_hours: f.get("cut_off_hours") ? Number(f.get("cut_off_hours")) : undefined,
            status: String(f.get("status") || "open") as TourOption["status"],
          };

          if (initial?._id) {
            await adminUpdateTourOption(initial._id, payload);
          } else {
            await adminCreateTourOption(payload as any);
          }
          await onSaved();
        }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {initial ? "Sửa lịch khởi hành" : "Thêm lịch khởi hành"}
          </div>
          <button
            type="button"
            className="h-9 w-9 grid place-items-center rounded-full border hover:bg-slate-50"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Ngày (YYYY-MM-DD)</span>
            <input
              name="start_date"
              required
              defaultValue={initial?.start_date?.slice(0, 10)}
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-slate-600">Giờ (HH:mm)</span>
            <input
              name="start_time"
              placeholder="08:00"
              defaultValue={initial?.start_time}
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-slate-600">Sức chứa tổng</span>
            <input
              name="capacity_total"
              type="number"
              min={1}
              required
              defaultValue={initial?.capacity_total ?? 20}
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-slate-600">Cut-off (giờ trước giờ đi)</span>
            <input
              name="cut_off_hours"
              type="number"
              min={0}
              defaultValue={initial?.cut_off_hours ?? 2}
              className="w-full h-10 rounded-lg border px-3"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm text-slate-600">Trạng thái</span>
            <select
              name="status"
              defaultValue={initial?.status ?? "open"}
              className="w-full h-10 rounded-lg border px-3"
            >
              <option value="open">open</option>
              <option value="full">full</option>
              <option value="closed">closed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-lg border hover:bg-slate-50"
          >
            Huỷ
          </button>
          <button className="px-4 h-10 rounded-lg bg-slate-900 text-white hover:opacity-90">
            {initial ? "Lưu" : "Tạo"}
          </button>
        </div>
      </form>
    </div>
  );
}

