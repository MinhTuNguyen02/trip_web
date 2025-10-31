// src/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { getSummary, getRevenue, getTopDestinations } from "../api/admin";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

type RevenuePoint = { label: string; revenue: number };
type TopDest = { name: string; travellers: number };

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [range, setRange] = useState<"day" | "month" | "year">("month");
  const [topDests, setTopDests] = useState<TopDest[]>([]);

  // load số liệu tổng quan + top destinations
  useEffect(() => {
    (async () => {
      const s = await getSummary();
      setSummary(s);
      const td = await getTopDestinations();
      setTopDests(Array.isArray(td) ? td : []);
    })();
  }, []);

  // load doanh thu theo khoảng
  useEffect(() => {
    (async () => {
      const raw = await getRevenue(range);
      // Chuẩn hoá: chấp nhận cả { _id, revenue } hoặc { label, revenue }
      const norm: RevenuePoint[] = (Array.isArray(raw) ? raw : []).map((d: any) => ({
        label: String(d?.label ?? d?._id ?? ""),
        revenue: Number(d?.revenue ?? 0),
      }));
      setRevenue(norm);
    })();
  }, [range]);

  if (!summary) return <div className="p-4">Đang tải…</div>;

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card title="Người dùng" value={Number(summary.users || 0).toLocaleString("vi-VN")} />
        <Card title="Tours" value={Number(summary.tours || 0).toLocaleString("vi-VN")} />
        <Card title="Đơn hàng" value={Number(summary.bookings || 0).toLocaleString("vi-VN")} />
        <Card
          title="Doanh thu"
          value={`${Number(summary.revenue || 0).toLocaleString("vi-VN")} đ`}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Doanh thu</h2>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
            className="border px-2 py-1 rounded"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              tickFormatter={(v) => Number(v).toLocaleString("vi-VN")}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(v: any) => `${Number(v).toLocaleString("vi-VN")} đ`}
              labelFormatter={(l) => `Kỳ: ${l}`}
            />
            <Line type="monotone" dataKey="revenue" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top destinations */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Điểm đến nhiều người đặt nhất</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topDests}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(v: any) => Number(v).toLocaleString("vi-VN")} />
            <Bar dataKey="travellers" />
          </BarChart>
        </ResponsiveContainer>
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
