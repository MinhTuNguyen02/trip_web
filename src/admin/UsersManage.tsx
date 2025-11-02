/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UsersManager.tsx
import React, { useEffect, useMemo, useState, useCallback, useContext, useRef } from "react";
import { createAdmin, listAdmins, listUsers } from "../api/admin";
import { toggleUserActive, deleteUser } from "../api/auth";
import type { User } from "../types";
import { AuthCtx } from "../contexts/AuthContext";

type Tab = "users" | "admins";

export default function UsersManager() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // search states
  const [qUsers, setQUsers] = useState("");
  const [qAdmins, setQAdmins] = useState("");
  const typingRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  // form add admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const auth = useContext(AuthCtx);
  const currentUserId = auth?.user?.id;

  const reloadUsers = useCallback(async (qU?: string, qA?: string) => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([listUsers(qU), listAdmins(qA)]);
      setUsers(u);
      setAdmins(a);
    } finally {
      setLoading(false);
    }
  }, []);

  // first load
  useEffect(() => {
    reloadUsers(qUsers, qAdmins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (typingRef.current) window.clearTimeout(typingRef.current);
    };
  }, []);

  const debounceReload = (nextQU: string, nextQA: string) => {
    if (typingRef.current) window.clearTimeout(typingRef.current);
    typingRef.current = window.setTimeout(() => {
      reloadUsers(nextQU, nextQA);
    }, 400);
  };

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
      await reloadUsers(qUsers, qAdmins);
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

      {/* Tabs + Search */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab("users")}
          className={`px-3 py-1.5 rounded-lg border ${tab === "users" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Users
          <span className="ml-2 inline-flex items-center justify-center text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setTab("admins")}
          className={`px-3 py-1.5 rounded-lg border ${tab === "admins" ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
        >
          Admins
          <span className="ml-2 inline-flex items-center justify-center text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {admins.length}
          </span>
        </button>

        <div className="ml-auto">
          {tab === "users" ? (
            <input
              value={qUsers}
              onChange={(e) => {
                const v = e.target.value;
                setQUsers(v);
                debounceReload(v, qAdmins);
              }}
              placeholder="Tìm theo tên/email/SĐT/địa chỉ…"
              className="h-9 px-3 border rounded-lg w-[260px]"
            />
          ) : (
            <input
              value={qAdmins}
              onChange={(e) => {
                const v = e.target.value;
                setQAdmins(v);
                debounceReload(qUsers, v);
              }}
              placeholder="Tìm admin…"
              className="h-9 px-3 border rounded-lg w-[260px]"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-slate-500">Đang tải dữ liệu…</div>
      ) : tab === "users" ? (
        <UsersTable
          rows={usersSorted}
          currentUserId={currentUserId}
          onToggle={async (u) => {
            await toggleUserActive(u._id!, !u.is_active);
            await reloadUsers(qUsers, qAdmins);
          }}
          onDelete={async (u) => {
            if (!confirm(`Xóa user "${u.name}"?`)) return;
            await deleteUser(u._id!);
            await reloadUsers(qUsers, qAdmins);
          }}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdminsTable
              rows={adminsSorted}
              currentUserId={currentUserId}
              onToggle={async (u) => {
                await toggleUserActive(u._id!, !u.is_active);
                await reloadUsers(qUsers, qAdmins);
              }}
              onDelete={async (u) => {
                if (!confirm(`Xóa admin "${u.name}"?`)) return;
                await deleteUser(u._id!);
                await reloadUsers(qUsers, qAdmins);
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="font-semibold mb-3">Thêm admin</h2>
              {err && <div className="mb-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{err}</div>}
              {okMsg && <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">{okMsg}</div>}
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Tên</span>
                  <input className="w-full h-10 rounded-lg border px-3" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Email</span>
                  <input className="w-full h-10 rounded-lg border px-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Mật khẩu</span>
                  <input type="password" className="w-full h-10 rounded-lg border px-3" value={pwd} onChange={(e) => setPwd(e.target.value)} />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm text-slate-600">Xác nhận mật khẩu</span>
                  <input type="password" className="w-full h-10 rounded-lg border px-3" value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
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

function UsersTable({
  rows, currentUserId,
  onToggle, onDelete,
}: {
  rows: User[];
  currentUserId?: string;
  onToggle: (u: User) => Promise<void>;
  onDelete: (u: User) => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-[980px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left">Mã</th>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">SĐT</th>
            <th className="p-2 text-left">Địa chỉ</th>
            <th className="p-2 text-center">Trạng thái</th>
            <th className="p-2 text-left">Tạo lúc</th>
            <th className="p-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const self = String(u._id) === String(currentUserId);
            return (
              <tr key={u._id} className="border-t hover:bg-slate-50/40">
                <td className="p-2 font-mono">{u._id || "—"}</td>
                <td className="p-2 font-medium">{u.name || "—"}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.phone || "—"}</td>
                <td className="p-2">{u.address || "—"}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-600" : "bg-slate-400"}`} />
                    {u.is_active ? "Đang hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString("vi-VN") : "—"}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => onToggle(u)}
                    disabled={self}
                    className={`px-2 py-1 rounded border cursor-pointer ${self ? "opacity-50 cursor-not-allowed" : "bg-slate-50 hover:bg-slate-100"}`}
                    title={self ? "Không thể tự bật/tắt chính mình" : ""}
                  >
                    {u.is_active ? "Khóa" : "Mở"}
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    disabled={self}
                    className={`px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer ${self ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={self ? "Không thể tự xóa chính mình" : ""}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr><td colSpan={8} className="p-4 text-center text-slate-500">Chưa có người dùng.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminsTable({
  rows, currentUserId,
  onToggle, onDelete,
}: {
  rows: User[];
  currentUserId?: string;
  onToggle: (u: User) => Promise<void>;
  onDelete: (u: User) => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-[880px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-center">Trạng thái</th>
            <th className="p-2 text-left">Tạo lúc</th>
            <th className="p-2 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const self = String(u._id) === String(currentUserId);
            return (
              <tr key={u._id} className="border-t hover:bg-slate-50/40">
                <td className="p-2 font-medium">{u.name || "—"}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald-600" : "bg-slate-400"}`} />
                    {u.is_active ? "Đang hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString("vi-VN") : "—"}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => onToggle(u)}
                    disabled={self}
                    className={`px-2 py-1 rounded border cursor-pointer ${self ? "opacity-50 cursor-not-allowed" : "bg-slate-50 hover:bg-slate-100"}`}
                    title={self ? "Không thể tự bật/tắt chính mình" : ""}
                  >
                    {u.is_active ? "Khóa" : "Mở"}
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    disabled={self}
                    className={`px-2 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer ${self ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={self ? "Không thể tự xóa chính mình" : ""}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr><td colSpan={5} className="p-4 text-center text-slate-500">Chưa có admin.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
