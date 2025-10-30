// src/components/OptionPicker.tsx
import { useEffect, useMemo, useState, useContext } from "react";
import type { TourOption } from "../types";
import { listTourOptions } from "../api/tourOption";
import { addCartItemTour } from "../api/cart";
import { AuthCtx } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { CartCtx } from "../contexts/CartContext";

export default function OptionPicker({
  tourId,
  open,
  onClose,
  onAdded,
}: {
  tourId: string;
  open: boolean;
  onClose(): void;
  onAdded?(): void;
}) {
  const [opts, setOpts] = useState<TourOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [picked, setPicked] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [err, setErr] = useState<string>("");

  const { user } = useContext(AuthCtx);
  const { refresh } = useCart(); // ✅ để đồng bộ navbar/badge & CartPage
  const navigate = useNavigate();
  const location = useLocation();

  const { addTourItem  } = useContext(CartCtx)!;
  // Khi mở modal: reset state + load options
  useEffect(() => {
    if (!open) return;
    setPicked("");
    setQty(1);
    setErr("");
    setLoading(true);
    listTourOptions(tourId, { onlyOpen: 1, onlyFuture: 1 })
      .then((list) => setOpts(list))
      .catch((e) =>
        setErr(
          e?.response?.data?.error ||
            e.message ||
            "Không tải được lịch khởi hành"
        )
      )
      .finally(() => setLoading(false));
  }, [open, tourId]);

  const current = useMemo(() => opts.find((o) => o._id === picked), [opts, picked]);
  const maxQty = Math.max(0, current?.remaining ?? 0);
  const disabledReason = useMemo(() => {
    if (!picked) return "Hãy chọn lịch khởi hành";
    if (!current) return "Lịch không hợp lệ";
    if (current.isDisabled || maxQty <= 0) return "Lịch này không còn khả dụng";
    if (qty < 1) return "Số lượng phải ≥ 1";
    if (maxQty && qty > maxQty) return `Tối đa ${maxQty}`;
    return "";
  }, [picked, current, qty, maxQty]);

  async function handleAdd() {
    setErr("");
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (disabledReason) {
      setErr(disabledReason);
      return;
    }
    try {
      setSubmitting(true);
      await addTourItem ({ tourId, optionId: picked, qty });
      // đồng bộ toàn app
      await refresh();
      window.dispatchEvent(new Event("cart:updated"));
      onAdded?.();
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.error || e.message || "Thêm vào giỏ thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Chọn lịch khởi hành</div>
          <button
            className="h-9 w-9 grid place-items-center rounded-full border hover:bg-slate-50"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {err && (
          <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Đang tải lịch…</div>
        ) : !opts.length ? (
          <div className="text-sm text-slate-500">Hiện chưa có lịch mở bán.</div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {opts.map((o) => {
                const disabled = !!o.isDisabled || (o.remaining ?? 0) <= 0;
                const labelDate = o.start_date.slice(0, 10);
                const labelTime = o.start_time ? ` • ${o.start_time}` : "";
                const labelTail = disabled
                  ? " • (không khả dụng)"
                  : ` • còn ${o.remaining}`;
                return (
                  <label
                    key={o._id}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                      picked === o._id ? "bg-emerald-50 border-emerald-200" : "bg-white"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="opt"
                      disabled={disabled}
                      checked={picked === o._id}
                      onChange={() => setPicked(o._id)}
                    />
                    <span className="text-sm">
                      {labelDate}
                      {labelTime}
                      {labelTail}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Số lượng</span>
                <input
                  type="number"
                  min={1}
                  max={maxQty || undefined}
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value || 1);
                    if (!Number.isFinite(v)) return;
                    setQty(Math.max(1, Math.min(v, maxQty || Infinity)));
                  }}
                  className="w-20 h-9 border rounded-lg px-2"
                />
                {maxQty ? (
                  <span className="text-xs text-slate-500">(tối đa {maxQty})</span>
                ) : null}
              </div>
              <button
                onClick={handleAdd}
                disabled={!!disabledReason || submitting}
                className={`px-4 h-10 rounded-lg text-white hover:opacity-90 ${
                  submitting || disabledReason
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-slate-900"
                }`}
              >
                {submitting ? "Đang thêm…" : "Thêm vào giỏ"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
