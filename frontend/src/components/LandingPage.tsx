import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wifi, Shield, Zap, Droplet, Train, Eye, ArrowRight, Star, MapPin, 
  ChevronLeft, ChevronRight, Inbox, Bath, Car, Heart
} from "lucide-react";
import { Room } from "../types";

interface LandingPageProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  isLoading: boolean;
}

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rian Aditya",
    role: "Karyawan Swasta",
    comment: "Sangat puas tinggal di Raikos Suite Balkon! Fasilitas persis di foto, internet luar biasa kencang untuk WFH, dan lokasinya dekat sekali ke Stasiun LRT Jatibening.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 2,
    name: "Amanda Lestari",
    role: "Mahasiswi",
    comment: "Bagi mahasiswi seperti saya, keamanan nomor satu. Raikos punya CCTV 24 jam dan gerbang aman. Pembayaran kos gampang tinggal upload bukti di dashboard.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: 3,
    name: "Dwi Nugroho",
    role: "Software Engineer",
    comment: "Proses booking kamar kos paling praktis yang pernah saya alami. Desain kamarnya minimalis banget, sirkulasi udara juga segar. Recommended bertenaga!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  }
];

export default function LandingPage({ rooms, onSelectRoom, isLoading }: LandingPageProps) {
  // Slider State
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Testimonial Interval slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleTestimonialPrev = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleTestimonialNext = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative Background Gradients from design theme */}
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-blue-100 dark:bg-blue-950/20 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-100 dark:bg-indigo-950/20 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-block px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-sky-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-900/30">
              #1 Property Management System • Jatibening Bekasi
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6.5xl text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1] mb-4">
              Temukan Hunian Nyaman <br/>
              <span className="text-blue-600 dark:text-sky-400 underline decoration-indigo-200 dark:decoration-indigo-850 underline-offset-8">
                Bersama Raikos
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl max-w-xl font-normal leading-relaxed mb-8">
              Pencarian dan Pemesanan Kos Kini Lebih Mudah, Modern, dan Instan. Hunian premium siap huni dengan jaminan keamanan & fasilitas idaman.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => {
                  const el = document.getElementById("daftar-kamar");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-6 py-3.5 text-center font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Cari Kamar Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("fasilitas");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-6 py-3.5 text-center font-bold rounded-full text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 space-x-1.5 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
              >
                Lihat Fasilitas Lengkap
              </button>
            </div>
          </motion.div>

          {/* Hero Visual Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Shadow Rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-2xl blur-xl -z-10" />
            <div className="overflow-hidden rounded-2xl border border-white/60 dark:border-slate-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"
                alt="Elite Boarding House Room"
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Float badge */}
            <div className="absolute -bottom-6 -left-6 glass-panel p-4 rounded-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold font-mono text-sm shadow">
                4.9
              </div>
              <div className="text-left">
                <div className="flex gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none mt-1">Hunian Terfavorit</p>
                <p className="text-[10px] text-slate-400">Pilihan Ratusan Penyewa</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED ROOMS SECTION */}
      <section id="daftar-kamar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div className="text-left">
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-900">
              Pilihan Kamar Unggulan
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Desain modern berstandar hunian elite, klik DETAIL untuk melihat spesifikasi dan sewa.
            </p>
          </div>
        </div>

        {/* Dynamic loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-10 bg-slate-200 rounded-xl w-full pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4"
          >
            <Inbox className="w-12 h-12 text-slate-300" />
            <div className="text-center">
              <p className="font-semibold text-slate-700">Kamar tidak ditemukan</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {rooms.map((room) => {
                return (
                  <motion.div
                    key={room.id}
                    layoutId={`rk-room-card-${room.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:border-slate-200 transition-all text-left flex flex-col justify-between"
                  >
                    {/* Media Container */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={room.images[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg text-white uppercase tracking-wider shadow ${
                          room.status === "tersedia" 
                            ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/10" 
                            : (room.status === "dipesan" || room.status === "BOOKED")
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/10"
                            : "bg-gradient-to-r from-slate-500 to-slate-700 shadow-slate-500/10"
                        }`}>
                          {room.status === "tersedia" ? "Tersedia" : (room.status === "dipesan" || room.status === "BOOKED") ? "Dipesan" : "Terisi"}
                        </span>
                        
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white/90 text-slate-800 w-fit backdrop-blur">
                          {room.type}
                        </span>
                      </div>

                      {/* LRT Near Badge */}
                      {room.lrt_nearby && (
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm text-[10px] font-bold text-blue-600">
                          <Train className="w-3.5 h-3.5" />
                          Dekat LRT
                        </div>
                      )}
                    </div>

                    {/* Meta Body */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h4 className="font-display font-bold text-lg text-slate-950 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {room.name}
                        </h4>

                        {/* Facilities Inline icons */}
                        <div className="flex items-center gap-3 mt-2 mb-4 text-slate-400">
                          {room.wifi && <Wifi className="w-4 h-4 text-blue-500" title="Wi-Fi" />}
                          {room.bathroom_inside && <Droplet className="w-4 h-4 text-sky-500" title="Kamar Mandi Dalam" />}
                          {room.electricity_token && <Zap className="w-4 h-4 text-amber-500" title="Listrik Token" />}
                          {room.security && <Shield className="w-4 h-4 text-teal-500" title="Security 24 Jam" />}
                        </div>

                        {/* Description excerpt */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {room.description}
                        </p>
                      </div>

                      {/* Detail view button trigger */}
                      <div className="pt-3 border-t border-slate-100">
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => onSelectRoom(room)}
                          className="w-full py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* FACILITIES SECTION */}
      <section id="fasilitas" className="bg-white border-t border-slate-100 py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-semibold text-3xl text-slate-900">
              Fasilitas
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Kami mempersiapkan setiap fasilitas prima demi memaksimalkan kenyamanan hidup sehari-hari Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              {
                icon: <Bath className="w-8 h-8 text-blue-600" />,
                title: "Kamar Mandi Dalam"
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-500" />,
                title: "Listrik Token Mandiri"
              },
              {
                icon: <Droplet className="w-8 h-8 text-sky-500" />,
                title: "Pompa Air Mandiri"
              },
              {
                icon: <Train className="w-8 h-8 text-violet-500" />,
                title: "Dekat LRT Jatibening"
              },
              {
                icon: <Car className="w-8 h-8 text-teal-600" />,
                title: "Area Parkir"
              },
              {
                icon: <Heart className="w-8 h-8 text-red-500" />,
                title: "Lingkungan Nyaman"
              }
            ].map((fac, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 text-center hover:border-blue-500/30 shadow-sm hover:shadow transition-all group flex flex-col items-center justify-center gap-3"
              >
                <div className="group-hover:scale-110 transition-transform">
                  {fac.icon}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 leading-snug">{fac.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SLIDER SECTION */}
      <section id="testimoni" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
            Dengar Apa Kata Mereka
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Ulasan jujur dari penghuni aktif yang merasakan kenyamanan hidup sesungguhnya bersama Raikos.
          </p>
        </div>

        {/* Carousel slide body */}
        <div className="relative max-w-3xl mx-auto">
          {/* Controls left */}
          <button
            onClick={handleTestimonialPrev}
            className="absolute left-0 lg:-left-16 top-1/2 -translate-y-1/2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 z-10 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 p-8 sm:p-12 rounded-3xl shadow-lg relative min-h-[220px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center text-left w-full"
              >
                <div className="sm:col-span-1 flex justify-center sm:justify-start">
                  <img
                    src={TESTIMONIALS[activeTestimonial].avatar}
                    alt={TESTIMONIALS[activeTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-950/20"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="sm:col-span-3 space-y-3">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(TESTIMONIALS[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                    "{TESTIMONIALS[activeTestimonial].comment}"
                  </p>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                      {TESTIMONIALS[activeTestimonial].name}
                    </h5>
                    <p className="text-xs text-slate-400 font-mono">
                      {TESTIMONIALS[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls right */}
          <button
            onClick={handleTestimonialNext}
            className="absolute right-0 lg:-right-16 top-1/2 -translate-y-1/2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 z-10 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots indices indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTestimonial(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeTestimonial === idx 
                  ? "bg-indigo-600 dark:bg-sky-400 w-6" 
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/60 pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <span className="font-display font-extrabold text-white text-2xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Raikos
            </span>
            <p className="text-xs leading-relaxed">
              Solusi modern info hunian kos, booking instan, dan sistem ERP pengurusan admin dalam satu platform terpercaya.
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              © 2026 Raikos. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById("cari-kamar");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Pencarian Unit Kamar
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById("fasilitas");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Fasilitas Gedung
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById("testimoni");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Ulasan Penyewa
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Kontak Kami
            </h4>
            <address className="not-italic text-xs space-y-2">
              <p>📍 Jl. Terusan Kincir No.8, Jatibening, Pondok Gede, Kota Bekasi, Jawa Barat</p>
              <p>📞 Whatsapp: 0812-3456-7890</p>
              <p>✉️ Email: support@raikos.com</p>
            </address>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Sosial Media
            </h4>
            <div className="flex gap-3">
              {["Instagram", "Tiktok", "Linkedin"].map((s) => (
                <a
                  key={s}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
                >
                  {s}
                </a>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">
              Tipe Relasi Database: MySQL 8.0 Indexed Core Engine with Innodb Storage.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
