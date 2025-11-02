/* eslint-disable @typescript-eslint/no-explicit-any */
// src/admin/POIsManage.tsx
import { useEffect, useMemo, useState } from "react";
import { listPOIs } from "../api/pois";
import { listDestinations } from "../api/destinations";
import {
  adminCreatePOI,
  adminUpdatePOI,
  adminDeletePOI,
  adminTogglePOIActive,
} from "../api/admin";
import { api } from "../api/http";
import type { Destination, POI } from "../types";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";

const POI_TYPES = [
  { value: "sightseeing", label: "Tham quan" },
  { value: "food", label: "Ẩm thực" },
  { value: "nature", label: "Thiên nhiên" },
  { value: "nightlife", label: "Giải trí ban đêm" },
  { value: "other", label: "Khác" },
] as const;

// ✅ Map O(1) để tra nhãn nhanh
const POI_TYPE_LABELS: Record<string, string> = {
  sightseeing: "Tham quan",
  food: "Ẩm thực",
  nature: "Thiên nhiên",
  nightlife: "Giải trí ban đêm",
  other: "Khác",
};

export default function POIsManage() {
  const [dests, setDests] = useState<Destination[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [destFilter, setDestFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<POI | null>(null); // null = đóng form; {} = tạo mới

  const reload = async (fDest?: string, fType?: string) => {
    setLoading(true);
    const [ds, ps] = await Promise.all([
      listDestinations(),
      listPOIs({
        ...(fDest ? { destination: fDest } : {}),
        ...(fType ? { type: fType } : {}),
      } as any),
    ]);
    setDests(ds);
    setPois(ps);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    reload(destFilter, typeFilter); 
  }, [destFilter, typeFilter]);

  const destMap = useMemo(
    () =>
      dests.reduce<Record<string, string>>((m, d) => {
        m[d._id] = (d as any).name ?? "";
        return m;
      }, {}),
    [dests]
  );

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-sm text-slate-600 mb-1">Lọc theo điểm đến</div>
          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Tất cả</option>
            {dests.map((d) => (
              <option key={d._id} value={d._id}>
                {(d as any).name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-sm text-slate-600 mb-1">Loại POI</div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Tất cả</option>
            {POI_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className="ml-auto px-3 py-2 rounded-lg bg-slate-900 text-white cursor-pointer"
          onClick={() => setEditing({} as any)}
        >
          + Thêm POI
        </button>
      </div>

      <div className="border rounded-xl overflow-x-auto">
        <table className="min-w-[1024px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Điểm đến</th>
              <th className="p-2 text-left">Loại</th>
              <th className="p-2 text-center">Giờ mở</th>
              <th className="p-2 text-center">Giờ đóng</th>
              <th className="p-2 text-center">Thời lượng</th>
              <th className="p-2 text-right">Giá ước tính</th>
              <th className="p-2 text-center">Trạng thái</th>
              <th className="p-2 w-44"></th>
            </tr>
          </thead>
          <tbody>
            {pois.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{destMap[p.destination_id] || p.destination_id}</td>
                <td className="p-2">
                  {POI_TYPE_LABELS[p.type] ?? "—" /* ✅ dùng map O(1) */}
                </td>
                <td className="p-2 text-center">{p.open_from || "-"}</td>
                <td className="p-2 text-center">{p.open_to || "-"}</td>
                <td className="p-2 text-center">{p.duration_min || 0} phút</td>
                <td className="p-2 text-right">
                  {p.price_est ? p.price_est.toLocaleString("vi-VN") + " đ" : "-"}
                </td>
                <td className="p-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      p.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        p.is_active ? "bg-emerald-600" : "bg-slate-400"
                      }`}
                    />
                    {p.is_active ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="px-2 py-1 rounded border cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={async () => {
                      // await adminTogglePOIActive(p._id, !p.is_active);
                      // await reload(destFilter, typeFilter);
                      const updated = await adminTogglePOIActive(p._id, !p.is_active);
                      setPois(prev => prev.map(x => (x._id === updated._id ? updated : x)));
                    }}
                    className="px-2 py-1 rounded border bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    {p.is_active ? "Tắt" : "Bật"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Xóa POI "${p.name}"?`)) return;
                      await adminDeletePOI(p._id);
                      await reload(destFilter, typeFilter);
                    }}
                    className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer" 
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {!pois.length && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={9}>
                  Không có POI nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <POIForm
          dests={dests}
          initial={editing._id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            if (editing?._id) await adminUpdatePOI(editing._id, data);
            else await adminCreatePOI(data);
            setEditing(null);
            await reload(destFilter, typeFilter);
          }}
        />
      )}
    </div>
  );
}

function POIForm({
  dests,
  initial,
  onClose,
  onSubmit,
}: {
  dests: Destination[];
  initial?: Partial<POI>;
  onClose(): void;
  onSubmit(data: Partial<POI>): Promise<void>;
}) {
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [openFrom, setOpenFrom] = useState<string>(initial?.open_from || "08:00");
  const [openTo, setOpenTo] = useState<string>(initial?.open_to || "21:00");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<{ url: string }>("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setImages((arr) => [...arr, data.url]);
  }
  const removeImage = (url: string) => setImages((arr) => arr.filter((u) => u !== url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const is_active = f.get("is_active") !== null;

          const data: Partial<POI> = {
            destination_id: String(f.get("destination_id") || ""),
            name: String(f.get("name") || ""),
            type: (String(f.get("type") || "other") as POI["type"]),
            duration_min: f.get("duration_min") ? Number(f.get("duration_min")) : undefined,
            open_from: openFrom,
            open_to: openTo,
            price_est: f.get("price_est") ? Number(f.get("price_est")) : undefined,
            tags: String(f.get("tags") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            geo: {
              lat: f.get("lat") ? Number(f.get("lat")) : undefined,
              lng: f.get("lng") ? Number(f.get("lng")) : undefined,
            },
            images,
            is_active,
          };

          if (!data.destination_id || !data.name) {
            alert("Vui lòng nhập đủ: Điểm đến và Tên POI.");
            return;
          }
          await onSubmit(data);
        }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b bg-white">
          <h3 className="text-lg md:text-xl font-semibold">
            {initial?._id ? "Sửa POI" : "Thêm POI"}
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
          {/* Nhóm: thông tin cơ bản */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Thông tin cơ bản</div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Điểm đến</span>
                <select
                  name="destination_id"
                  defaultValue={initial?.destination_id}
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
                <span className="text-sm text-slate-600">Tên POI</span>
                <input
                  name="name"
                  defaultValue={initial?.name}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                  placeholder="VD: Chợ Bến Thành"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Loại</span>
                <select
                  name="type"
                  defaultValue={(initial as any)?.type || "other"}
                  className="w-full border rounded-lg h-10 px-3"
                >
                  {POI_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Thời lượng (phút)</span>
                <input
                  name="duration_min"
                  type="number"
                  min={0}
                  defaultValue={(initial as any)?.duration_min}
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>

              <div className="space-y-1">
                <span className="block text-sm text-slate-600">Giờ mở cửa</span>
                <TimePicker value={openFrom} onChange={(v) => setOpenFrom(v as string)} disableClock />
              </div>
              <div className="space-y-1">
                <span className="block text-sm text-slate-600">Giờ đóng cửa</span>
                <TimePicker value={openTo} onChange={(v) => setOpenTo(v as string)} disableClock />
              </div>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Giá ước tính (VND)</span>
                <input
                  name="price_est"
                  type="number"
                  min={0}
                  defaultValue={(initial as any)?.price_est}
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Tags</span>
                <input
                  name="tags"
                  defaultValue={(initial as any)?.tags?.join(", ")}
                  className="w-full border rounded-lg h-10 px-3"
                  placeholder="Ví dụ: sống ảo, đặc sản, check-in"
                />
              </label>

              {/* Geo */}
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Vĩ độ (lat)</span>
                <input
                  name="lat"
                  type="number"
                  step="any"
                  defaultValue={(initial as any)?.geo?.lat}
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Kinh độ (lng)</span>
                <input
                  name="lng"
                  type="number"
                  step="any"
                  defaultValue={(initial as any)?.geo?.lng}
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>
            </div>
          </section>

          {/* Ảnh */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Ảnh POI</div>
            <input type="file" accept="image/*" onChange={handleUpload} />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="preview" className="h-24 w-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    title="Xoá ảnh"
                    className="absolute -top-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-black/70 text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Hiển thị */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Hiển thị</div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={initial?._id ? !!initial?.is_active : true}
              />
              Hiển thị POI (is_active)
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-3 border-t bg-white">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-lg border hover:bg-slate-50 cursor-pointer">
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

