import { NavLink, Outlet } from "react-router-dom";

const i = (active: boolean) =>
  `block px-3 py-2 rounded-lg text-sm ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`;

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-64px)] grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-1">
        <div className="font-bold text-lg mb-2">Admin</div>
        <NavLink to="/admin" end className={({isActive}) => i(isActive)}>Tổng quan</NavLink>
        <NavLink to="/admin/tours" className={({isActive}) => i(isActive)}>Quản lý Tours</NavLink>
        <NavLink to="/admin/destinations" className={({isActive}) => i(isActive)}>Điểm đến</NavLink>
        <NavLink to="/admin/pois" className={({isActive}) => i(isActive)}>Quản lý POIs</NavLink>
        <NavLink to="/admin/bookings" className={({isActive}) => i(isActive)}>Đơn hàng</NavLink>
        <NavLink to="/admin/payments" className={({isActive}) => i(isActive)}>Thanh toán</NavLink>
      </aside>
      <main className="p-6"><Outlet/></main>
    </div>
  );
}
