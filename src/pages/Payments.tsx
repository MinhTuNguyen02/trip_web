import { useEffect, useState } from "react";
import { myPayments } from "../api/payments";
import type { Payment } from "../types";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " đ";

export default function PaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    myPayments()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Đang tải lịch sử thanh toán…</div>;
  if (err) return <div className="p-6 text-rose-600">{err}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lịch sử thanh toán</h1>
      <ul className="divide-y border rounded-xl bg-white">
        {items.map((p) => {
          const created = new Date(p.createdAt).toLocaleString("vi-VN");
          const badge =
            p.status === "succeeded"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : p.status === "failed" || p.status === "canceled"
              ? "text-rose-700 bg-rose-50 border-rose-200"
              : "text-amber-700 bg-amber-50 border-amber-200";
          return (
            <li key={p._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {p.provider.toUpperCase()} • <span className={`px-2 py-0.5 rounded-full border text-xs ${badge}`}>{p.status}</span>
                </div>
                <div className="text-sm text-gray-600">{created} • mã: {p.intent_id}</div>
              </div>
              <div className="font-semibold">{vnd(p.amount)}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
