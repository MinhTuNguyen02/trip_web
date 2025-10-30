import { useEffect, useState } from "react";
import { listDestinations } from "../api/destinations";
import {
  adminCreateDestination,
  adminUpdateDestination,
  adminDeleteDestination,
  adminToggleDestinationActive,
} from "../api/admin";
import { api } from "../api/http";
import type { Destination } from "../types";

export default function DestinationsManage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Destination | null>(null);

  const reload = async () => {
    setLoading(true);
    const ds = await listDestinations();
    setItems(ds);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, []);

  if (loading) return <div>Đang tải…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý Điểm đến</h1>
        <button
          onClick={() => setEditing({} as any)}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white cursor-pointer"
        >
          + Thêm điểm đến
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-2 text-left">Mã</th>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Vùng</th>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Mô tả</th>
              <th className="p-2 w-48"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-2 font-mono">{d.code}</td>
                <td className="p-2 font-medium">{d.name}</td>
                <td className="p-2">{d.region || "-"}</td>
                <td className="p-2">
                  {d.images?.length ? (
                    <img
                      src={d.images[0]}
                      alt={d.name}
                      className="h-12 w-20 object-cover rounded-md border"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      d.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        d.is_active ? "bg-emerald-600" : "bg-slate-400"
                      }`}
                    />
                    {d.is_active ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="p-2 text-slate-600">
                  {d.description?.slice(0, 80) || "-"}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => setEditing(d)}
                    className="px-2 py-1 rounded border cursor-pointer"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={async () => {
                      // Optimistic update
                      const next = !d.is_active;
                      setItems((prev) =>
                        prev.map((x) =>
                          x._id === d._id ? { ...x, is_active: next } : x
                        )
                      );
                      try {
                        const updated = await adminToggleDestinationActive(
                          d._id,
                          next
                        );
                        // đảm bảo sync đúng với server trả về
                        setItems((prev) =>
                          prev.map((x) =>
                            x._id === updated._id ? (updated as Destination) : x
                          )
                        );
                      } catch (e) {
                        // rollback nếu lỗi
                        setItems((prev) =>
                          prev.map((x) =>
                            x._id === d._id ? { ...x, is_active: !next } : x
                          )
                        );
                        alert("Không thể cập nhật trạng thái. Vui lòng thử lại!");
                      }
                    }}
                    className="px-2 py-1 rounded border bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    {d.is_active ? "Tắt" : "Bật"}
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm(`Xóa ${d.name}?`)) return;
                      await adminDeleteDestination(d._id);
                      await reload();
                    }}
                    className="px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={7}>
                  Chưa có điểm đến nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <DestinationForm
          initial={editing._id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            if (editing?._id) await adminUpdateDestination(editing._id, data);
            else await adminCreateDestination(data);
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function DestinationForm({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Partial<Destination>;
  onClose(): void;
  onSubmit(data: Partial<Destination>): Promise<void>;
}) {
  const [preview, setPreview] = useState<string[]>(initial?.images || []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const form = new FormData();
    form.append("file", file);
  
    const { data } = await api.post<{ url: string }>("/upload", form);
  
    setPreview((p) => [...p, data.url]);
  }
  
  const removeImage = (url: string) => setPreview((p) => p.filter((x) => x !== url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const is_active = f.get("is_active") !== null;
          const data: Partial<Destination> = {
            code: String(f.get("code") || "").toUpperCase(),
            name: String(f.get("name") || ""),
            region: String(f.get("region") || "") || undefined,
            description: String(f.get("description") || "") || undefined,
            images: preview,
            is_active,
          };
          await onSubmit(data);
        }}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b bg-white">
          <h3 className="text-lg md:text-xl font-semibold">
            {initial?._id ? "Sửa điểm đến" : "Thêm điểm đến"}
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
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Thông tin cơ bản</div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-slate-600">Mã (VD: HNI, DAD)</span>
                <input
                  name="code"
                  defaultValue={initial?.code}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-slate-600">Tên điểm đến</span>
                <input
                  name="name"
                  defaultValue={initial?.name}
                  required
                  className="w-full border rounded-lg h-10 px-3"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Vùng/miền</span>
                <input
                  name="region"
                  defaultValue={initial?.region}
                  className="w-full border rounded-lg h-10 px-3"
                  placeholder="VD: Bắc Trung Bộ, Tây Nguyên…"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm text-slate-600">Mô tả</span>
                <textarea
                  name="description"
                  defaultValue={initial?.description}
                  className="w-full border rounded-lg px-3 py-2 min-h-[88px]"
                  placeholder="Thông tin khái quát về điểm đến…"
                />
              </label>
            </div>
          </section>

          {/* Ảnh */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Ảnh điểm đến</div>
            <input type="file" accept="image/*" onChange={handleUpload} />
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {preview.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="preview" className="h-24 w-full object-cover rounded-lg border" />
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

          {/* Hiển thị */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Hiển thị</div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={initial?._id ? !!initial?.is_active : true}
              />
              Hiển thị điểm đến (is_active)
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-3 border-t bg-white">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-lg border hover:bg-slate-50 cursor-pointer">
            Hủy
          </button>
          <button className="px-4 h-10 rounded-lg bg-slate-900 text-white cursor-pointer hover:opacity-90">
            {initial?._id ? "Lưu" : "Tạo"}
          </button>
        </div>
      </form>
    </div>
  );
}
