import { useEffect, useState } from "react";
import { listTours } from "../api/tours";
import { listMyBookings } from "../api/bookings";
import { myPayments } from "../api/payments";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tours: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([listTours(), listMyBookings(), myPayments()])
      .then(([t, b, p]) => {
        const revenue = p.filter((x:any)=>x.status==="succeeded").reduce((s:any,x:any)=>s+Number(x.amount||0),0);
        setStats({ tours: t.length, bookings: b.length, revenue });
      });
  }, []);

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <Card title="Tours" value={stats.tours.toLocaleString()} />
      {/* <Card title="Đơn hàng" value={stats.bookings.toLocaleString()} /> */}
      <Card title="Doanh thu" value={stats.revenue.toLocaleString("vi-VN")+" đ"} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border p-5 bg-white">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
