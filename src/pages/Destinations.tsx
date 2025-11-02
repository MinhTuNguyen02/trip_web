/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { geoMercator, geoPath } from "d3-geo";
import * as topojson from "topojson-client";
import { Loader2, MapPin } from "lucide-react";

import type { Destination, POI } from "../types";
import { listDestinations } from "../api/destinations";
import { listPOIs } from "../api/pois";

// ------------ CONFIG -----------------
const TOPOJSON_URL = "/data/vietnam-provinces.topo.json"; // put your file here

// Colors
const COLORS = {
  base: "#f5e6df",
  stroke: "#c9b2a9",
  hover: "#fde2cf",
  selected: "#fcbf49",
};

// Helpers
const removeAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// Chuẩn hóa để so khớp tên feature với tên Destination
const normForMatch = (s: string) => {
  let t = removeAccents(s);
  // bỏ tiền tố phổ biến
  t = t
    .replace(/^tp\.?\s*/i, "")
    .replace(/^tinh\s*/i, "")
    .replace(/^thanh pho\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  // một số alias thường gặp
  t = t
    .replace(/^ba ria[-\s]*vung tau$/, "ba ria vung tau")
    .replace(/^ho chi minh|^tp ho chi minh$/, "ho chi minh")
    .replace(/^thu a thien[-\s]*hue$|^thua thien[-\s]*hue$/, "hue") // cho dữ liệu sau sáp nhập
    .replace(/^ha noi$/, "ha noi");
  return t;
};

function getFeatureName(props: Record<string, any>): string {
  return (
    props?.new_name ||
    props?.NAME_1 ||
    props?.name ||
    props?.NAME_ENG ||
    props?.ten_tinh ||
    props?.province ||
    "(unknown)"
  );
}

// Tooltip UI (absolute)
function Tooltip({
  x, y, cw, ch, // nhận thêm kích thước container
  dest,
  fallbackName,
}: {
  x: number;
  y: number;
  cw: number;
  ch: number;
  dest?: Destination | null;
  fallbackName?: string;
}) {
  const PAD = 8;            // padding sát mép container
  const OFFSET = 12;        // lệch khỏi con trỏ
  const EST_W = 280;        // ước lượng rộng tooltip
  const EST_H = 120;        // ước lượng cao tooltip

  const left = Math.min(x + OFFSET, Math.max(PAD, cw - EST_W - PAD));
  const top  = Math.min(y + OFFSET, Math.max(PAD, ch - EST_H - PAD));

  return (
    <div
      className="pointer-events-none absolute z-10 max-w-xs rounded-lg border border-slate-200 bg-white/95 p-3 shadow"
      style={{ left, top }}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <MapPin className="size-4" />
        {dest?.name ?? fallbackName ?? "—"}
      </div>
      <div className="mt-1 text-xs text-slate-600">
        <div><span className="font-medium">Mã:</span> {dest?.code ?? "—"}</div>
        <div><span className="font-medium">Vùng:</span> {dest?.region ?? "—"}</div>
        {dest?.description && (
          <div className="mt-1 line-clamp-3">{dest.description}</div>
        )}
      </div>
    </div>
  );
}


export default function VietnamMap({
  onPick,
}: {
  onPick?: (provinceName: string) => void;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0, cw: 0, ch: 0 });
  const [featureCollection, setFeatureCollection] = React.useState<any>(null);
  const [loadingMap, setLoadingMap] = React.useState(true);
  const [errorMap, setErrorMap] = React.useState<string | null>(null);

  const [destinations, setDestinations] = React.useState<Destination[]>([]);
  const [loadingDest, setLoadingDest] = React.useState(true);
  const [errorDest, setErrorDest] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [activeName, setActiveName] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Destination | null>(null);

  const [pois, setPois] = React.useState<POI[]>([]);
  const [loadingPOI, setLoadingPOI] = React.useState(false);

  // Load topojson
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingMap(true);
        const res = await fetch(TOPOJSON_URL);
        if (!res.ok) throw new Error(`Failed to load TopoJSON: ${res.status}`);
        const topo = await res.json();
        const objectKey = Object.keys(topo.objects || {})[0];
        const fc = topojson.feature(topo, topo.objects[objectKey]);
        setFeatureCollection(fc);
        setErrorMap(null);
      } catch (e: any) {
        setErrorMap(e?.message || "Load error");
      } finally {
        setLoadingMap(false);
      }
    })();
  }, []);

  // Load destinations from API
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingDest(true);
        const items = await listDestinations(); // GET /destinations
        setDestinations(items || []);
        setErrorDest(null);
      } catch (e: any) {
        setErrorDest(e?.message || "Load destinations error");
      } finally {
        setLoadingDest(false);
      }
    })();
  }, []);

  // Map tên chuẩn hoá -> Destination
  const destByKey = React.useMemo(() => {
    const m = new Map<string, Destination>();
    for (const d of destinations) {
      const keys = new Set<string>([
        normForMatch(d.name),
        normForMatch(d.name.replace(/^TP\.?\s*/i, "")), // TP. Hà Nội -> Hà Nội
      ]);
      // Nếu code trùng logic tên, có thể thêm key theo code để hover theo code (tuỳ dữ liệu)
      for (const k of keys) m.set(k, d);
    }
    return m;
  }, [destinations]);

  const width = 1200;
  const height = 1400;
  const PADDING = 24;

  const projection = React.useMemo(() => {
    const p = geoMercator();
    if (featureCollection) {
      p.fitExtent(
        [[PADDING, PADDING], [width - PADDING, height - PADDING]],
        featureCollection as any
      );
    } else {
      p.center([108.2, 16.5]).scale(1600).translate([width / 2, height / 2]);
    }
    return p;
  }, [featureCollection]);

  const path = React.useMemo(() => geoPath(projection), [projection]);

  const features: any[] = featureCollection?.features || [];

  // filter hiển thị theo ô search
  const visibleFeature = (name: string, dest?: Destination | null) => {
    if (!query) return true;
    const nq = removeAccents(query);
    if (removeAccents(name).includes(nq)) return true;
    if (dest && removeAccents(dest.name).includes(nq)) return true;
    if (dest && dest.region && removeAccents(dest.region).includes(nq)) return true;
    return false;
  };

  // khi click: chọn destination tương ứng + load POIs
  const handleClick = async (name: string) => {
    const key = normForMatch(name);
    const d = destByKey.get(key) || null;
    setSelected(d);
    onPick?.(d?.name ?? name);
    if (d) {
      try {
        setLoadingPOI(true);
        const data = await listPOIs({ destination: d._id });
        setPois(data || []);
      } catch {
        setPois([]);
      } finally {
        setLoadingPOI(false);
      }
    } else {
      setPois([]);
    }
  };

  // toạ độ nhãn đảo
  const hoangSaXY = projection([112.33, 16.5]);
  const truongSaXY = projection([115.2, 10.5]);

  return (
    <div className="w-full min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
          Khám phá điểm đến
        </h1>
      </div>

      {/* Thanh search đơn giản */}
      <div className="mx-auto max-w-6xl px-4 mt-6">
        <div className="relative w-full sm:w-96">
          {/* <Search className="absolute left-3 top-2.5 size-4 text-slate-400" /> */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên/miền…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-2 sm:px-4 mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* MAP */}
        <div ref={wrapRef} className="relative rounded-2xl bg-white shadow-sm p-2 sm:p-3">
          {loadingMap || loadingDest ? (
            <div className="flex h-[70vh] items-center justify-center text-slate-500 gap-2">
              <Loader2 className="size-5 animate-spin" /> Đang tải bản đồ/danh sách…
            </div>
          ) : errorMap ? (
            <div className="p-4 text-rose-600 text-sm">Lỗi tải bản đồ: {errorMap}.</div>
          ) : errorDest ? (
            <div className="p-4 text-rose-600 text-sm">Lỗi tải dữ liệu tỉnh: {errorDest}.</div>
          ) : (
            <>            
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                onMouseMove={(e) => {
                  const rect = wrapRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const x = e.clientX - rect.left; // tọa độ tương đối bên trái container
                  const y = e.clientY - rect.top;  // tọa độ tương đối bên trên container
                  setMouse({ x, y, cw: rect.width, ch: rect.height });
                }}
                onMouseLeave={() => setActiveName(null)} // rời SVG thì ẩn tooltip
              >
                {features.map((f: any, idx: number) => {
                  const name = getFeatureName(f.properties);
                  const key = normForMatch(name);
                  const dest = destByKey.get(key) || null;
                  if (!visibleFeature(name, dest)) return null;

                  const isActive = activeName === name;
                  const isSelected = selected && dest && selected._id === dest._id;

                  return (
                    <path
                      key={idx}
                      d={path(f) || ""}
                      onMouseEnter={() => setActiveName(name)}
                      onMouseLeave={() => setActiveName((p) => (p === name ? null : p))}
                      onClick={() => handleClick(name)}
                      style={{
                        fill: isSelected ? COLORS.selected : isActive ? COLORS.hover : COLORS.base,
                        stroke: COLORS.stroke,
                        strokeWidth: 0.9,
                        cursor: "pointer",
                        transition: "fill 150ms",
                      }}
                    >                      
                    </path>
                  );
                })}

                {/* Nhãn đảo */}
                {hoangSaXY && truongSaXY && (
                  <g className="pointer-events-none">
                    <g transform={`translate(${hoangSaXY[0]}, ${hoangSaXY[1]})`}>
                      <rect x={-60} y={-16} width={120} height={24} rx={6} fill="#ffffff" opacity={0.9} />
                      <text y={0} fontSize={12} textAnchor="middle" fill="#334155">
                        Q.Đ. HOÀNG SA
                      </text>
                    </g>
                    <g transform={`translate(${truongSaXY[0]}, ${truongSaXY[1]})`}>
                      <rect x={-70} y={-16} width={140} height={24} rx={6} fill="#ffffff" opacity={0.9} />
                      <text y={0} fontSize={12} textAnchor="middle" fill="#334155">
                        Q.Đ. TRƯỜNG SA
                      </text>
                    </g>
                  </g>
                )}
              </svg>

              {/* Tooltip */}
              {activeName && (
                <Tooltip
                  x={mouse.x}
                  y={mouse.y}
                  cw={mouse.cw}
                  ch={mouse.ch}
                  dest={destByKey.get(normForMatch(activeName))}
                  fallbackName={activeName}
                />
              )}
            </>
          )}
        </div>

        {/* ASIDE: thông tin Destination + POIs */}
        <aside className="rounded-2xl bg-white shadow-sm p-4">
          {!selected ? (
            <div className="text-sm text-slate-500">
              Di chuột để xem tooltip. Bấm vào một tỉnh để xem chi tiết & các địa điểm tham quan.
            </div>
          ) : (
            <>
              <div className="mb-3">
                <div className="text-xl font-bold text-slate-800">{selected.name}</div>
                {selected.images?.length ? (
                    <img
                      src={selected.images[0]}
                      alt={selected.name}
                      className="h-auto w-100 object-cover rounded-md border my-5"
                    />
                  ) : (
                    "-"
                  )}
                <div className="text-sm text-slate-600">
                  <span className="font-medium">Mã:</span> {selected.code} ·{" "}
                  <span className="font-medium">Vùng:</span> {selected.region ?? "—"}
                </div>
                {selected.description && (
                  <p className="mt-2 text-sm text-slate-700">{selected.description}</p>
                )}
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-800 mb-2">
                  Điểm tham quan
                </div>
                {loadingPOI ? (
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Đang tải địa điểm tham quan...
                  </div>
                ) : pois.length === 0 ? (
                  <div className="text-xs text-slate-500">Chưa có điểm tham quan cho địa phương này.</div>
                ) : (
                  <ul className="space-y-2">
                    {pois.map((p) => (
                      <li key={p._id} className="rounded border border-slate-200 p-2">
                        <div className="text-sm font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">
                          {p.type ?? "—"} · {p.duration_min ? `${p.duration_min} phút` : "—"} ·{" "}
                          {p.price_est ? `${p.price_est.toLocaleString()}đ` : "Giá cập nhật sau"}
                        </div>
                        {p.tags?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <span key={t} className="text-[10px] rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
