export default function Home() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-white via-sky-50/40 to-white relative overflow-hidden">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* vòng tròn mờ lớn */}
        <div className="absolute top-[-10rem] left-[-10rem] w-[25rem] h-[25rem] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
        {/* dải cong nhẹ bên phải */}
        <div className="absolute bottom-[-8rem] right-[-10rem] w-[30rem] h-[30rem] bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
        {/* pattern chéo nhạt */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 40 L40 0%22 stroke=%22%23e0f2fe%22 stroke-width=%221%22/></svg>')] opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative text-white py-24 px-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-[3rem] shadow-lg">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Khám phá thế giới cùng Raumania
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Nền tảng du lịch thông minh giúp bạn lên kế hoạch, đặt tour và trải nghiệm hành trình trọn vẹn.
          </p>
          <a
            href="/tours"
            className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition"
          >
            Khám phá Tour
          </a>
        </div>
        <div className="absolute inset-0 bg-[url('/images/hero-travel.jpg')] bg-cover bg-center opacity-15"></div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center relative">
        <div className="absolute top-0 left-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sứ mệnh của chúng tôi</h2>
          <p className="text-gray-600 leading-relaxed">
            Trip ra đời với sứ mệnh mang lại cho khách hàng những hành trình du lịch an toàn, tiện lợi và đầy cảm xúc.
            Chúng tôi hướng đến việc tối ưu trải nghiệm đặt tour bằng công nghệ hiện đại, minh bạch và nhanh chóng.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Tầm nhìn & Mục tiêu</h2>
          <p className="text-gray-600 leading-relaxed">
            Trip hướng tới trở thành nền tảng du lịch hàng đầu Việt Nam, kết nối hàng triệu khách hàng với các điểm
            đến trong nước và quốc tế. Mục tiêu của chúng tôi là không chỉ mang đến dịch vụ du lịch, mà còn truyền cảm
            hứng khám phá, kết nối và trải nghiệm văn hoá.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[25rem] h-[25rem] bg-sky-100 rounded-full blur-3xl opacity-30"></div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Dịch vụ nổi bật</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌍",
                title: "Tour trong nước & quốc tế",
                desc: "Đa dạng lựa chọn tour du lịch trọn gói, khám phá thiên nhiên, văn hoá và ẩm thực tại hàng trăm điểm đến.",
              },
              {
                icon: "💳",
                title: "Thanh toán an toàn qua VietQR",
                desc: "Tích hợp hệ thống payOS giúp khách hàng thanh toán nhanh, an toàn và minh bạch chỉ trong vài giây.",
              },
              {
                icon: "🧭",
                title: "Tư vấn & hỗ trợ 24/7",
                desc: "Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng đồng hành cùng bạn trong mọi hành trình du lịch.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 group-hover:opacity-40 transition"></div>
                <div className="text-blue-600 text-4xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Liên hệ với chúng tôi</h2>
          <p className="text-gray-600">
            Trip luôn lắng nghe để mang đến trải nghiệm tốt nhất cho khách hàng.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4 text-gray-700">
            <p><strong>📍 Địa chỉ:</strong> 123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh</p>
            <p><strong>📞 Hotline:</strong> 0901 234 567</p>
            <p><strong>📧 Email:</strong> support@trip.vn</p>
            <p><strong>⏰ Giờ làm việc:</strong> 8h00 – 22h00 (Thứ 2 – Chủ nhật)</p>
          </div>

          <form className="bg-white rounded-xl shadow p-6 space-y-4">
            <input
              type="text"
              placeholder="Họ và tên"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email liên hệ"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
            <textarea
              placeholder="Nội dung tin nhắn..."
              className="w-full border rounded-lg p-2 h-32 focus:ring-2 focus:ring-blue-400 outline-none"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 text-sm py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Trip Travel Co. — All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
