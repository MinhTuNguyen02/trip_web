import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../contexts/CartContext";

/** small utility for active link styles */
const linkBase =
  "text-sm md:text-[15px] px-2.5 py-1.5 rounded-md transition-colors";
const linkIdle = "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70";
const linkActive = "text-slate-900 bg-slate-100";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const { cart } = useCart(); 
  const cartQty = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((s, i) => s + (i.qty || 0), 0);
  }, [cart]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: brand + desktop nav */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <span className="inline-grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400/60 to-indigo-600/60 text-white font-semibold backdrop-blur-md border border-white/30 shadow-lg">
              R
            </span>
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Raumania
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/destinations"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Điểm đến
            </NavLink>
            <NavLink
              to="/tours"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Tours
            </NavLink>
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              AI Planner
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Admin
              </NavLink>
            )}
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          {/* Cart (ẩn với admin) */}
          {!isAdmin && (
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6h14l-1.5 9h-11L5 3H2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="20" r="1.5" fill="currentColor" />
                <circle cx="17.5" cy="20" r="1.5" fill="currentColor" />
              </svg>
              {cartQty > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                  {cartQty}
                </span>
              )}
            </Link>
          )}

          {/* Auth actions */}
          {user ? (
            <div className="relative">
              {/* avatar button */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-2.5 h-10 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">
                  {user.name?.slice(0, 1).toUpperCase() || "U"}
                </span>
                <span className="hidden sm:block text-sm text-slate-700">
                  {user.name}
                </span>
                <svg
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* dropdown */}
              {open && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg p-1"
                  onMouseLeave={() => setOpen(false)}
                >
                  {isAdmin ? (
                    <NavLink
                      to="/admin"
                      className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      Trang quản trị
                    </NavLink>
                  ) : (
                    <>
                      <NavLink
                        to="/profile"
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setOpen(false)}
                      >
                        Hồ sơ
                      </NavLink>
                      <NavLink
                        to="/bookings"
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setOpen(false)}
                      >
                        Đơn đã đặt
                      </NavLink>
                      <NavLink
                        to="/payments"
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setOpen(false)}
                      >
                        Lịch sử thanh toán
                      </NavLink>
                    </>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 h-10 inline-flex items-center rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-3 h-10 inline-flex items-center rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 hover:bg-slate-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`md:hidden border-t border-slate-200 px-4 transition-[max-height] overflow-hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="py-3 grid gap-1">
          <NavLink
            to="/destinations"
            className={({ isActive }) =>
              `block ${linkBase} ${isActive ? linkActive : linkIdle}`
            }
            onClick={() => setOpen(false)}
          >
            Điểm đến
          </NavLink>
          <NavLink
            to="/tours"
            className={({ isActive }) =>
              `block ${linkBase} ${isActive ? linkActive : linkIdle}`
            }
            onClick={() => setOpen(false)}
          >
            Tours
          </NavLink>
          <NavLink
            to="/pois"
            className={({ isActive }) =>
              `block ${linkBase} ${isActive ? linkActive : linkIdle}`
            }
            onClick={() => setOpen(false)}
          >
            POIs
          </NavLink>
          <NavLink
            to="/ai"
            className={({ isActive }) =>
              `block ${linkBase} ${isActive ? linkActive : linkIdle}`
            }
            onClick={() => setOpen(false)}
          >
            AI Planner
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `block ${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              onClick={() => setOpen(false)}
            >
              Admin
            </NavLink>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg border border-slate-200 text-center"
                onClick={() => setOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-lg bg-slate-900 text-white text-center"
                onClick={() => setOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
