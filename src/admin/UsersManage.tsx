// src/pages/UsersManager.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createAdmin, listAdmins, listUsers } from "../api/admin";
import type { User } from "../types";

type Tab = "users" | "admins";

export default function UsersManager() {
  const [tab, setTab] = useState<Tab>("users");

  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // form add admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const reloadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([listUsers(), listAdmins()]);
      setUsers(u);
      setAdmins(a);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadUsers();
  }, [reloadUsers]);

  const usersSorted = useMemo(
    () => [...users].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")),
    [users]
  );
  const adminsSorted = useMemo(
    () => [...admins].sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || "")),
    [admins]
  );

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    if (!name.trim()) return setErr("Vui lòng nhập tên.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Email không hợp lệ.");
    if (pwd.length < 6) return setErr("Mật khẩu tối thiểu 6 ký tự.");
    if (pwd !== pwd2) return setErr("Xác nhận mật khẩu không khớp.");

    try {
      setSubmitting(true);
      await createAdmin({ name: name.trim(), email: email.trim(), password: pwd });
      setOkMsg("Tạo admin thành công.");
      setName(""); setEmail(""); setPwd(""); setPwd2("");
      await reloadUsers();
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || "Tạo admin thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quản lý người dùng</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("users")}
          className={`px-3 py-1.5 rounded-lg border ${
            tab === "users" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setTab("admins")}
          className={`px-3 py-1.5 rounded-lg border ${
            tab === "admins" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
          }`}
        >
          Admins
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-slate-500">Đang tải dữ liệu…</div>
      ) : tab === "users" ? (
        <UsersTable rows={usersSorted} />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdminsTable rows={adminsSorted} />
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="font-semibold mb-3">Thêm admin</h2>
              {err && <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{err}</div>}
              {okMsg && <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">{okMsg}</div>}
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Tên</span>
                  <input
                    className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Email</span>
                  <input
                    className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Mật khẩu</span>
                  <input
                    type="password"
                    className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="••••••"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Xác nhận mật khẩu</span>
                  <input
                    type="password"
                    className="w-full h-10 rounded-lg border px-3 placeholder:text-slate-400"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    placeholder="••••••"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full h-10 rounded-lg text-white ${submitting ? "bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {submitting ? "Đang tạo…" : "Tạo admin"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTable({ rows }: { rows: User[] }) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-[820px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left">Mã</th>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">SĐT</th>
            <th className="p-2 text-left">Địa chỉ</th>
            <th className="p-2 text-left">Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u._id} className="border-t hover:bg-slate-50/40">
              <td className="p-2 font-medium">{u._id || "—"}</td>
              <td className="p-2 font-medium">{u.name || "—"}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.phone || "—"}</td>
              <td className="p-2">{u.address || "—"}</td>
              <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString("vi-VN") : "—"}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} className="p-4 text-center text-slate-500">Chưa có người dùng.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminsTable({ rows }: { rows: User[] }) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-[720px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u._id} className="border-t hover:bg-slate-50/40">
              <td className="p-2 font-medium">{u.name || "—"}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString("vi-VN") : "—"}</td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={3} className="p-4 text-center text-slate-500">Chưa có admin.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
