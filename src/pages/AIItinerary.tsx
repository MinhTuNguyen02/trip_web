import { useEffect, useState } from "react";
import { listDestinations } from "../api/destinations";
import { buildItinerary } from "../api/ai";
import type { Destination, ItineraryResponse } from "../types";

export default function AIItineraryPage() {
  const [dests, setDests] = useState<Destination[]>([]);
  const [res, setRes] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { listDestinations().then(setDests); }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      destinationId: String(f.get("destinationId")),
      startDate: String(f.get("startDate")),
      days: Number(f.get("days")),
      budget: f.get("budget") ? Number(f.get("budget")) : undefined,
      prefs: Array.from(f.getAll("prefs")) as any,
    };
    setLoading(true);
    try {
      const out = await buildItinerary(body);
      setRes(out);
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI gợi ý lịch trình</h1>

      <form onSubmit={onSubmit} className="grid gap-3 grid-cols-1 md:grid-cols-2 mb-6">
        <select name="destinationId" className="border p-2 rounded" required>
          <option value="">-- Chọn điểm đến --</option>
          {dests.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <input type="date" name="startDate" className="border p-2 rounded" required />
        <input type="number" name="days" min={2} max={5} defaultValue={3} className="border p-2 rounded" required />
        <input type="number" name="budget" placeholder="Ngân sách (VND)" className="border p-2 rounded" />
        <div className="md:col-span-2 flex flex-wrap gap-3">
          {["biển","ẩm thực","thiên nhiên","đêm"].map(p => (
            <label key={p} className="inline-flex items-center gap-2">
              <input type="checkbox" name="prefs" value={p} /> {p}
            </label>
          ))}
        </div>
        <button disabled={loading} className="md:col-span-2 px-4 py-2 rounded bg-gray-900 text-white">
          {loading ? "Đang tạo..." : "Tạo lịch trình"}
        </button>
      </form>

      {res && (
        <div className="space-y-4">
          <div className="text-gray-700">
            Tổng chi phí ước tính: <b>{res.summary.est_cost.toLocaleString()} đ</b>
            {res.summary.budget_ok !== undefined && (
              <span> • {res.summary.budget_ok ? "Trong ngân sách ✅" : "Vượt ngân sách ⚠️"}</span>
            )}
          </div>

          {res.plan.map(day => (
            <div key={day.day} className="border rounded-xl p-4">
              <div className="font-semibold mb-2">Ngày {day.day}</div>
              <div className="grid gap-2 md:grid-cols-3">
                {day.slots.map(s => (
                  <div key={s.slot}>
                    <div className="text-sm text-gray-500 mb-1">{s.slot}</div>
                    <ul className="text-sm space-y-1">
                      {s.items.map(i => (
                        <li key={i.id} className="flex justify-between">
                          <span>{i.title} ({i.start_time})</span>
                          <span className="font-medium">{i.price.toLocaleString()} đ</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {day.note && <div className="text-sm text-gray-500 mt-2">{day.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
