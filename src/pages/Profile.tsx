/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, changePassword } from "../api/auth";
import { Eye, EyeOff } from "lucide-react"; // npm i lucide-react nếu chưa có

export default function ProfilePage() {
  const { user, loading } = useAuth();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // password state
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwdConfirm, setNewPwdConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [changing, setChanging] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string>("");

  // fill form từ user trong AuthContext
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone((user as any).phone || "");
    setAddress((user as any).address || "");
  }, [user]);

  if (loading) return <div className="p-6 text-center">Đang tải…</div>;
  if (!user) return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Hồ sơ</h1>
      <div>Bạn chưa đăng nhập.</div>
    </div>
  );

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setMsg("Đã lưu thông tin hồ sơ.");
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e.message || "Lưu thất bại");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2500);
    }
  }

  async function onChangePwd(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg("");

    if (!curPwd || !newPwd || !newPwdConfirm) {
      setPwdMsg("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (newPwd !== newPwdConfirm) {
      setPwdMsg("Xác nhận mật khẩu không khớp.");
      return;
    }

    setChanging(true);
    try {
      await changePassword(curPwd, newPwd);
      setPwdMsg("Đổi mật khẩu thành công.");
      setCurPwd(""); 
      setNewPwd("");
      setNewPwdConfirm("");
    } catch (e: any) {
      setPwdMsg(e?.response?.data?.error || e.message || "Đổi mật khẩu thất bại");
    } finally {
      setChanging(false);
      setTimeout(() => setPwdMsg(""), 2500);
    }
  }

  const pwdFieldType = showPwd ? "text" : "password";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* -------- Hồ sơ -------- */}
      {user.role!="admin" && <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold mb-4">Thông tin cá nhân</h1>

        {msg && <div className="mb-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded">{msg}</div>}

        <form onSubmit={onSaveProfile} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Họ tên</span>
            <input className="w-full h-10 rounded-lg border px-3" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-slate-600">Email (không thể đổi)</span>
            <input className="w-full h-10 rounded-lg border px-3 bg-slate-100" value={email} disabled />
          </label>

          <label className="space-y-1">
            <span className="text-sm text-slate-600">Số điện thoại</span>
            <input className="w-full h-10 rounded-lg border px-3" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-slate-600">Địa chỉ</span>
            <input className="w-full h-10 rounded-lg border px-3" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>

          <div className="sm:col-span-2">
            <button className={`px-4 h-10 rounded-lg text-white ${saving ? "bg-slate-400" : "bg-slate-900 hover:opacity-90"}`} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>}

      {/* -------- Đổi mật khẩu -------- */}
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>

        {pwdMsg && <div className="mb-3 text-sm bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded">{pwdMsg}</div>}

        <form onSubmit={onChangePwd} className="grid gap-4 sm:grid-cols-2">
          {[ 
            { label: "Mật khẩu hiện tại", value: curPwd, setter: setCurPwd },
            { label: "Mật khẩu mới", value: newPwd, setter: setNewPwd },
            { label: "Xác nhận mật khẩu mới", value: newPwdConfirm, setter: setNewPwdConfirm }
          ].map((field, i) => (
            <label key={i} className="space-y-1 sm:col-span-1">
              <span className="text-sm text-slate-600">{field.label}</span>
              <div className="relative">
                <input
                  type={pwdFieldType}
                  className="w-full h-10 rounded-lg border px-3 pr-10"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                  onClick={() => setShowPwd(x => !x)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          ))}

          <div className="sm:col-span-2">
            <button className={`px-4 h-10 rounded-lg text-white ${changing ? "bg-slate-400" : "bg-slate-900 hover:opacity-90"}`} disabled={changing}>
              {changing ? "Đang đổi…" : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
