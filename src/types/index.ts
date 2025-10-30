export type ISODateTime = string; // ISO string từ Mongo timestamps

// Khi server populate, object có cấu trúc tối thiểu; nếu không, chỉ là string ObjectId
export type TourLite =
  | string
  | {
      _id: string;
      title: string;
      images?: string[];
      price?: number;
      duration_hr?: number;
    };

export type Tour = {
  _id: string;
  destination_id: string;
  departure_id: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  duration_hr: number;
  is_active: boolean;
  images?: string[];
  poi_ids?: string[];
  rating_avg?: number;
  policy: string;
};

export type CartItem = {
  _id: string;
  type: "tour";
  ref_id: string;        // ObjectId string
  qty: number;
  unit_price: number;
  option_id: string;
};

export type Cart = {
  user_id: string;
  items: CartItem[];
};

export type PaymentStatus =
  | "created"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type Payment = {
  _id: string;
  provider: "payos";
  status: PaymentStatus;
  amount: number;
  intent_id: string;     // orderCode của PayOS
  user_id: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  // Tuỳ webhook/checkout, có thể lưu lại payload để finalize
  payload?: {
    items?: Array<{
      cart_item_id: string;
      tour_id: string;
      option_id: string;
      qty: number;
      unit_price: number;
      snapshot?: { tour_title?: string; destination_id?: string };
      contact_name?: string;
      contact_phone?: string;
      address?: string;
    }>;
  };
};

export type Destination = {
  _id: string;
  code: string;
  name: string;
  region?: string;
  description?: string;
  is_active: boolean;
  images?: string[];
};

export type POI = {
  _id: string;
  destination_id: string;
  name: string;
  type?: string;
  duration_min?: number;
  price_est?: number;
  is_active: boolean;
  images: string[];
  open_from: string;
  open_to: string;
  tags?: string[];
  geo?: { lat: number; lng: number };
};

export type ItinerarySlotItem = {
  type: "tour";
  id: string;
  title: string;
  duration_hr: number;
  price: number;
  start_time: string;
};

export type ItineraryDay = {
  day: number;
  slots: { slot: "Sáng" | "Chiều" | "Tối"; items: ItinerarySlotItem[] }[];
  note?: string;
};

export type ItineraryRequest = {
  destinationId: string;
  startDate: string;  // ISO
  days: number;       // 2..5
  budget?: number;
  prefs?: Array<"biển" | "ẩm thực" | "thiên nhiên" | "đêm">;
};

export type ItineraryResponse = {
  destinationId: string;
  startDate: string;
  days: number;
  plan: ItineraryDay[];
  summary: {
    destination: { id: string; name: string; region?: string };
    days: number;
    est_cost: number;
    budget_ok?: boolean;
  };
};

// (optional) flight quotes
export type FlightQuote = {
  _id?: string;
  itinerary_id?: string;
  origin: string;
  dest: string;
  depart_at: string;   // ISO date
  return_at?: string;  // ISO date
  price: number;
  deeplink?: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type BookingPaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type Booking = {
  _id: string;
  user_id: string;

  tour_id: TourLite;      // có thể là string (chưa populate) hoặc object (đã populate)
  option_id: string;

  start_date: string;     // ISO date (yyyy-mm-dd)
  start_time?: string;    // "HH:mm"

  qty: number;
  unit_price: number;
  total: number;

  // snapshot chống lệch dữ liệu
  snapshot_title?: string;
  snapshot_destination_id?: string;
  snapshot_destination_name?: string;

  // trạng thái
  status: BookingStatus;
  payment_status: BookingPaymentStatus;
  payment_id?: string;

  // liên hệ/ghi chú
  contact_name?: string;
  contact_phone?: string;
  note?: string;

  // NEW: điểm đón/hướng dẫn đón khách
  pickup_note?: string;

  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TourOptionStatus = "open" | "full" | "closed" | "cancelled";

export type TourOption = {
  _id: string;
  tour_id: string;
  start_date: string;     // ISO yyyy-MM-dd (server trả về từ Date)
  start_time?: string;    // "HH:mm"
  capacity_total: number;
  capacity_sold: number;
  cut_off_hours?: number;
  status: TourOptionStatus;

  // server enrich:
  remaining?: number;
  isDisabled?: boolean;
};

export type TicketStatus = "valid" | "used" | "refunded" | "void";

export type Ticket = {
  _id: string;
  booking_id: string;

  passenger?: {
    name?: string;
    phone?: string;
    address?: string;
  };

  code: string;        // mã vé ngắn, unique
  qr_payload: string;  // dùng để render QR
  status: TicketStatus;
  used_at?: ISODateTime;

  // đồng bộ hướng dẫn đón (copy từ booking khi tạo vé)
  pickup_note?: string;

  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};


export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  createdAt?: string;
};
