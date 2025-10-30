import { useSearchParams, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const [sp] = useSearchParams();
  const order = sp.get("order");
  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
      <p className="text-gray-700">Mã đơn (orderCode): <b>{order}</b></p>
      <Link to="/bookings" className="mt-4 inline-block px-4 py-2 rounded bg-gray-900 text-white">Xem booking</Link>
    </div>
  );
}
