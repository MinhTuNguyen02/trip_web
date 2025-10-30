import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");        // NEW
  const [address, setAddress] = useState("");    // NEW
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // NEW

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone, address); // NEW PARAMS
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/60 to-indigo-600/60 text-white font-semibold backdrop-blur-md border border-white/30 shadow-lg">
            R
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">Tạo tài khoản</h1>
          <p className="text-slate-500 text-sm mt-1">Khám phá thế giới dễ dàng cùng Trip</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-slate-700">Họ tên</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* NEW: Phone */}
          <div>
            <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              type="tel"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="0987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* NEW: Address */}
          <div>
            <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* NEW: Confirm password */}
          <div>
            <label className="text-sm font-medium text-slate-700">Nhập lại mật khẩu</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 placeholder:text-slate-400"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-slate-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
