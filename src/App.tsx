import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookings from "./pages/Bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import Destinations from "./pages/Destinations";
import Payments from "./pages/Payments";            
import BookingDetail from "./pages/BookingDetail";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import ToursManage from "./admin/ToursManage";
import POIsManage from "./admin/POIsManage";
import UsersManage from "./admin/UsersManage";
import BookingsManage from "./admin/BookingsManage";
import DestinationsManage from "./admin/DestinationsManage";
import TourDetail from "./pages/TourDetail";
import ProfilePage from "./pages/Profile";
import TicketPage from "./pages/Ticket";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="tours" element={<ToursManage />} />
            <Route path="pois" element={<POIsManage />} />
            <Route path="users" element={<UsersManage />} />
            <Route path="destinations" element={<DestinationsManage />} /> 
            <Route path="bookings" element={<BookingsManage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
