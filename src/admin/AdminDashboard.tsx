/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { getSummary, getSeries, getTopDestinations, type SeriesPoint, type SeriesRange } from "../api/admin";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from "recharts";

const fmt = (n: number) => n.toLocaleString("vi-VN");

export default function AdminDashboard() {
  // Cards
  const [summary, setSummary] = useState<{ users: number; tours: number } | null>(null);

  // Controls
  const [range, setRange] = useState<SeriesRange>("month");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Series + toggles
  const [rows, setRows] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOrders, setShowOrders] = useState(true);
  const [showRevenue, setShowRevenue] = useState(true);

  // Top destinations
  const [top, setTop] = useState<Array<{ name: string; travellers: number }>>([]);
  const [loadingTop, setLoadingTop] = useState(false);

  // Init summary
  useEffect(() => { getSummary().then(setSummary); }, []);

  // Default day range (7 ngày gần nhất)
  useEffect(() => {
    if (range === "day") {
      const e = new Date();
      const s = new Date();
      s.setDate(e.getDate() - 6);
      setDateFrom(s.toISOString().slice(0,10));
      setDateTo(e.toISOString().slice(0,10));
    }
  }, [range]);

  const canFetchDay = useMemo(() => {
    if (range !== "day") return true;
    if (!dateFrom || !dateTo) return false;
    const s = new Date(dateFrom), e = new Date(dateTo);
    const diff = (e.getTime() - s.getTime()) / (1000*60*60*24);
    return diff >= 0 && diff <= 30;
  }, [range, dateFrom, dateTo]);

  // Load series + top destinations
  const loadAll = async () => {
    setLoading(true);
    try {
      const params: any = { range };
      if (range === "day") { params.dateFrom = dateFrom; params.dateTo = dateTo; }
      if (range === "month") { params.year = year; }
      const data = await getSeries(params);
      setRows(data);
    } finally {
      setLoading(false);
    }

    setLoadingTop(true);
    try {
      const params: any = { range };
      if (range === "day") { params.dateFrom = dateFrom; params.dateTo = dateTo; }
      if (range === "month") { params.year = year; }
      const td = await getTopDestinations(params);
      setTop(td.map(x => ({ name: x.name, travellers: x.travellers })));
    } finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    if (range === "day") {
      if (canFetchDay) loadAll();
    } else {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, year, dateFrom, dateTo]);

  if (!summary) return <div className="p-4">Đang tải…</div>;

  return (
    <div className="space-y-6">
      {/* 1) 2 cards: Tours & Khách */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card title="Tours" value={fmt(summary.tours)} />
        <Card title="Người dùng" value={fmt(summary.users)} />
      </div>

      {/* 2) Biểu đồ CỘT: Đơn hàng & Doanh thu */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
          <h2 className="font-semibold">Thống kê đơn hàng & doanh thu</h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={range}
              onChange={(e)=>setRange(e.target.value as SeriesRange)}
              className="border px-2 py-1 rounded"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>

            {range === "day" && (
              <>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border px-2 py-1 rounded" />
                <span className="text-slate-500">→</span>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border px-2 py-1 rounded" />
                <button onClick={loadAll} disabled={!canFetchDay || loading} className="px-3 py-1 rounded border disabled:opacity-50">
                  Áp dụng
                </button>
              </>
            )}

            {range === "month" && (
              <select value={year} onChange={e=>setYear(Number(e.target.value))} className="border px-2 py-1 rounded">
                {Array.from({length: 6}).map((_,i)=>{
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            )}

            <label className="text-sm flex items-center gap-1 ml-2">
              <input type="checkbox" checked={showOrders} onChange={e=>setShowOrders(e.target.checked)} />
              Đơn hàng
            </label>
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={showRevenue} onChange={e=>setShowRevenue(e.target.checked)} />
              Doanh thu
            </label>
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis
                yAxisId="left"
                allowDecimals={false}
                tickFormatter={(v)=>fmt(Number(v))}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v)=>fmt(Number(v))}
              />

              <Tooltip
                formatter={(v:any, n:any)=>{
                  if (n==="revenue") return [`${fmt(Number(v))} đ`, "Doanh thu"];
                  if (n==="orders")  return [fmt(Number(v)), "Đơn hàng"];
                  return v;
                }}
                labelFormatter={(l)=>`Kỳ: ${l}`}
              />

              <Legend formatter={(name)=>{
                if (name==="orders")  return "Đơn hàng";
                if (name==="revenue") return "Doanh thu";
                return name;
              }} />

              {showOrders && (
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name="Đơn hàng"
                  fill="#809bce"   
                  radius={[3,3,0,0]}
                />
              )}

              {showRevenue && (
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Doanh thu"
                  fill="#84dcc6"   
                  radius={[3,3,0,0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3) Bảng chi tiết theo khoảng đã chọn */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold mb-3">Chi tiết theo kỳ</h3>

        {/* Container cuộn: giới hạn chiều cao */}
        <div className="overflow-x-auto">
          <div className="max-h-80 overflow-y-auto rounded-lg border">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="p-2 text-left">Kỳ</th>
                  <th className="p-2 text-right">Đơn hàng</th>
                  <th className="p-2 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t">
                    <td className="p-2">{r.label}</td>
                    <td className="p-2 text-right">{fmt(r.orders)}</td>
                    <td className="p-2 text-right">{fmt(r.revenue)} đ</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="p-3 text-center text-slate-500" colSpan={3}>
                      Không có dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4) Top 10 điểm đến trong khoảng đã chọn */}
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold mb-3">Top 10 điểm đến được đặt nhiều nhất</h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis allowDecimals={false} tickFormatter={(v)=>fmt(Number(v))} />
              <Tooltip formatter={(v:any)=>fmt(Number(v))} />
              <Bar dataKey="travellers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {loadingTop && <div className="text-sm text-slate-500 mt-2">Đang tải điểm đến…</div>}
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
