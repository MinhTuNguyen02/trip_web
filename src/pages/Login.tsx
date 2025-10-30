import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const nav = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Đăng nhập thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === "admin") nav("/admin");
      else nav("/");
    }
  }, [user]);

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/60 to-indigo-600/60 text-white font-semibold backdrop-blur-md border border-white/30 shadow-lg">
            R
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">Đăng nhập tài khoản</h1>
          <p className="text-slate-500 text-sm mt-1">Trải nghiệm du lịch thông minh cùng Trip</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none placeholder:text-slate-400"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none placeholder:text-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-slate-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-600 font-medium poiter hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
