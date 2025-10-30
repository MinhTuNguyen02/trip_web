import { useState } from "react";
import { searchFlightQuotes } from "../api/flightQuotes";
import type { FlightQuote } from "../types";

export default function FlightQuotesPage() {
  const [list, setList] = useState<FlightQuote[]>([]);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const params = {
      origin: String(f.get("origin")),
      dest: String(f.get("dest")),
      depart_at: String(f.get("depart_at")),
      return_at: String(f.get("return_at") || ""),
    };
    const data = await searchFlightQuotes(params);
    setList(data);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Báo giá vé máy bay</h1>
      <form onSubmit={onSubmit} className="grid gap-3 grid-cols-2 mb-6">
        <input name="origin" placeholder="SGN" className="border p-2 rounded" required />
        <input name="dest" placeholder="DAD" className="border p-2 rounded" required />
        <input type="date" name="depart_at" className="border p-2 rounded" required />
        <input type="date" name="return_at" className="border p-2 rounded" />
        <button className="col-span-2 px-4 py-2 rounded bg-gray-900 text-white">Tìm vé</button>
      </form>

      <ul className="divide-y">
        {list.map((q, idx) => (
          <li key={idx} className="py-3 flex items-center justify-between">
            <div>{q.origin} → {q.dest} • {q.depart_at}{q.return_at ? ` → ${q.return_at}` : ""}</div>
            <div className="font-semibold">{q.price.toLocaleString()} đ</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
