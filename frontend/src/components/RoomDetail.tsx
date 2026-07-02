import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Wifi, Shield, Zap, Droplet, Train, Check, Star, Calendar, 
  MapPin, User, FileText, Phone, Clock, Maximize2, X, Plus, Minus
} from "lucide-react";
import { Room, Booking } from "../types";

interface RoomDetailProps {
  room: Room;
  onBack: () => void;
  onSubmitBooking: (bookingData: Partial<Booking>) => void;
  currentUser: any;
  openLoginModal: () => void;
}

export default function RoomDetail({
  room,
  onBack,
  onSubmitBooking,
  currentUser,
  openLoginModal
}: RoomDetailProps) {
  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Billing cycle state: monthly or yearly
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Booking states
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    nik: currentUser?.nik || "",
    entryDate: "",
    duration: 1, // acts as months or years depending on billingCycle
  });

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pricing helper
  const unitPrice = billingCycle === "monthly" ? room.price_monthly : room.price_yearly;
  const totalPrice = unitPrice * formData.duration;

  // Sync current user fields if available
  React.useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || prev.phone,
        nik: currentUser.nik || prev.nik,
      }));
    }
  }, [currentUser]);

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = "Nama lengkap harus diisi";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      tempErrors.email = "Format email tidak valid";
    }
    if (!formData.phone.match(/^\d{10,14}$/)) {
      tempErrors.phone = "Nomor HP tidak valid (10-14 digit angka)";
    }
    if (!formData.nik.match(/^\d{16}$/)) {
      tempErrors.nik = "NIK harus tepat 16 digit angka";
    }
    if (!formData.entryDate) {
      tempErrors.entryDate = "Tanggal masuk harus ditentukan";
    } else {
      const selectedDate = new Date(formData.entryDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        tempErrors.entryDate = "Tanggal masuk tidak boleh masa lampau";
      }
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear singular error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal();
      return;
    }

    if (!validateForm()) return;

    onSubmitBooking({
      room_id: room.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      nik: formData.nik,
      entry_date: formData.entryDate,
      duration_months: billingCycle === "monthly" ? formData.duration : formData.duration * 12,
      total_price: totalPrice,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="flex justify-start mb-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          className="flex items-center gap-2 group text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          Kembali ke Pencarian Kos
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* LEFT COLUMN: GALLERY & DETAILS (Col 7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg group bg-slate-100 dark:bg-slate-950">
              <img
                src={room.images[activeImageIndex] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              
              <button
                onClick={() => setIsFullscreenOpen(true)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 transition-colors p-2.5 rounded-xl text-white shadow-md z-10"
                title="Fullscreen Image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnails preview */}
            {room.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {room.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 relative w-20 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex 
                        ? "border-indigo-600 scale-102 ring-2 ring-indigo-100 dark:ring-indigo-950" 
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading metadata */}
          <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-lg text-white uppercase tracking-wider ${
                (room.status === "Tersedia" || room.status === "tersedia")
                  ? "bg-emerald-500 shadow-md shadow-emerald-500/10" 
                  : (room.status === "BOOKED" || room.status === "dipesan")
                  ? "bg-amber-500 shadow-md shadow-amber-500/10"
                  : "bg-slate-500 shadow-md shadow-slate-500/10"
              }`}>
                Kamar {(room.status === "Tersedia" || room.status === "tersedia") ? "Tersedia" : (room.status === "BOOKED" || room.status === "dipesan") ? "Dipesan" : "Terisi"}
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-sky-400">
                {room.type}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
              {room.name}
            </h1>

            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>Jatibening Park, Bekasi Barat (Dekat Stasiun LRT Jatibening)</span>
            </div>
          </div>

          {/* Room Description */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
              Deskripsi Hunian
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Room amenities check */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
              Fasilitas Kamar Ini
            </h3>
            <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-350">
              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.wifi ? "bg-indigo-50 dark:bg-indigo-950/25 text-indigo-500" : "bg-slate-50 text-slate-300"}`}>
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Akses Internet</p>
                  <p className="font-semibold text-[13px]">{room.wifi ? "Wi-Fi Unlimited" : "Tidak Tersedia"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.bathroom_inside ? "bg-sky-50 dark:bg-sky-950/25 text-sky-500" : "bg-slate-50 text-slate-300"}`}>
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Kamar Mandi</p>
                  <p className="font-semibold text-[13px]">{room.bathroom_inside ? "Kamar Mandi Dalam" : "Kamar Mandi Luar"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.electricity_token ? "bg-amber-50 dark:bg-amber-950/25 text-amber-500" : "bg-slate-50 text-slate-300"}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Listrik Kamar</p>
                  <p className="font-semibold text-[13px]">{room.electricity_token ? "Sistem Token" : "Include Bulanan"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.water_independent ? "bg-blue-50 dark:bg-blue-950/25 text-blue-500" : "bg-slate-50 text-slate-300"}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Pompa Air</p>
                  <p className="font-semibold text-[13px]">{room.water_independent ? "Air Mandiri Stabil" : "Air Sentral Gedung"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.lrt_nearby ? "bg-violet-50 dark:bg-violet-950/25 text-violet-500" : "bg-slate-50 text-slate-300"}`}>
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Stasiun LRT</p>
                  <p className="font-semibold text-[13px]">{room.lrt_nearby ? "Dekat LRT Jatibening" : "Transit Kendaraan"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className={`p-1.5 h-8 w-8 rounded-lg flex items-center justify-center ${room.security ? "bg-rose-50 dark:bg-rose-950/25 text-rose-500" : "bg-slate-50 text-slate-300"}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-slate-400">Keamanan Kos</p>
                  <p className="font-semibold text-[13px]">{room.security ? "CCTV & Gerbang 24 Jam" : "Kunci Normal"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING SUMMARY & FORM (Col 5) */}
        <div className="lg:col-span-5 relative">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-lg text-slate-900">
                  Pilih Periode Sewa
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {/* Card Sewa Bulanan */}
                  <div
                    onClick={() => {
                      setBillingCycle("monthly");
                      setFormData((prev) => ({ ...prev, duration: 1 }));
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                      billingCycle === "monthly"
                        ? "border-blue-600 bg-blue-50/10 shadow-sm shadow-blue-500/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">Sewa Bulanan</span>
                      </div>
                      <p className="text-lg font-extrabold text-blue-600">
                        Rp {room.price_monthly.toLocaleString("id-ID")}
                        <span className="text-xs font-normal text-slate-400">/ bulan</span>
                      </p>
                    </div>
                    {billingCycle === "monthly" ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold font-sans">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-200 bg-white"></span>
                    )}
                  </div>

                  {/* Card Sewa Tahunan */}
                  <div
                    onClick={() => {
                      setBillingCycle("yearly");
                      setFormData((prev) => ({ ...prev, duration: 1 }));
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                      billingCycle === "yearly"
                        ? "border-amber-500 bg-amber-500/5 shadow-sm shadow-amber-500/5"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm font-bold text-slate-900">Sewa Tahunan</span>
                        <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Hemat</span>
                      </div>
                      <p className="text-lg font-extrabold text-slate-900">
                        Rp {room.price_yearly.toLocaleString("id-ID")}
                        <span className="text-xs font-normal text-slate-400">/ tahun</span>
                      </p>
                    </div>
                    {billingCycle === "yearly" ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-xs text-white font-bold font-sans">✓</span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-200 bg-white"></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action booking trigger */}
              {!isBookingFormOpen ? (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (room.status !== "Tersedia" && room.status !== "tersedia") return;
                      setIsBookingFormOpen(true);
                    }}
                    disabled={room.status !== "Tersedia" && room.status !== "tersedia"}
                    className={`w-full py-4 rounded-xl text-center font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                      (room.status === "Tersedia" || room.status === "tersedia")
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-indigo-500/15"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <span>
                      {(room.status === "Tersedia" || room.status === "tersedia")
                        ? "Booking Kamar Sekarang" 
                        : (room.status === "BOOKED" || room.status === "dipesan")
                        ? "Kamar Sudah Dipesan" 
                        : "Kamar Saat Ini Terisi"}
                    </span>
                  </motion.button>
                  <p className="text-[10px] text-center text-slate-400 leading-normal">
                    * Booking melalui sistem Raikos dijamin aman dengan monitoring tagihan transparan & respon pengelola cepat kurang dari 24 jam.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-1 border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest font-mono">
                      Formulir Pengajuan Sewa
                    </h4>
                    <button
                      onClick={() => setIsBookingFormOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Batal
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">
                        Nama Lengkap (Sesuai KTP)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                          placeholder="Contoh: Budi Santoso"
                        />
                      </div>
                      {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">
                        Alamat Email Aktif
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                          placeholder="contoh@domain.com"
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                      {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                    </div>

                    {/* NIK */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">
                        Nomor Induk Kependudukan (NIK 16 Digit)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type="text"
                          name="nik"
                          maxLength={16}
                          value={formData.nik}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                          placeholder="Contoh: 3275010203040005"
                        />
                      </div>
                      {errors.nik && <p className="text-[10px] text-rose-500 mt-0.5">{errors.nik}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Entry Date */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase mb-1">
                          Tanggal Masuk
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="entryDate"
                            value={formData.entryDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                          />
                        </div>
                        {errors.entryDate && <p className="text-[10px] text-rose-500 mt-0.5">{errors.entryDate}</p>}
                      </div>

                      {/* Duration Sewa */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                          Durasi Sewa ({billingCycle === "monthly" ? "Bulan" : "Tahun"})
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}
                            className="p-1 px-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-16 text-center text-slate-800">
                            {formData.duration} {billingCycle === "monthly" ? "Bulan" : "Tahun"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, duration: Math.min(billingCycle === "monthly" ? 12 : 3, prev.duration + 1) }))}
                            className="p-1 px-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Estimate Summary */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Biaya Kamar ({formData.duration} {billingCycle === "monthly" ? "bulan" : "tahun"})</span>
                        <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Biaya Administrasi & Deposit</span>
                        <span className="text-emerald-500 font-medium">Gratis Promo</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold text-slate-800">
                        <span>Estimasi Total Pembayaran</span>
                        <span className="text-blue-600">
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Submit Booking */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-95 shadow transition-all flex items-center justify-center gap-2"
                    >
                      {currentUser ? "Kirim Pengajuan Booking" : "Login & Lanjutkan Booking"}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center p-4"
          >
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-white border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl w-full aspect-video">
              <img
                src={room.images[activeImageIndex]}
                alt={room.name}
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Slide title */}
            <p className="text-white font-medium text-sm mt-4 font-display">
              {room.name} — Unit Image {activeImageIndex + 1} of {room.images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
