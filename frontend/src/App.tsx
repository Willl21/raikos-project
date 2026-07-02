import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, LogIn, Key, Mail, ShieldAlert, ArrowLeft, ArrowUp, Info, 
  HelpCircle, UserCheck, X, Moon, Sun, Database 
} from "lucide-react";

import { Room, User, Booking, Payment, Notification } from "./types";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import RoomDetail from "./components/RoomDetail";
import PenyewaDashboard from "./components/PenyewaDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ToastContainer, { ToastMessage, ToastType } from "./components/Toast";

export default function App() {
  // Global App States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState<string>(() => {
    const savedTab = localStorage.getItem("raikos-active-tab");
    if (savedTab) return savedTab;
    const savedRole = localStorage.getItem("raikos-role");
    if (savedRole === "admin") return "admin-dashboard";
    if (savedRole === "tenant") return "tenant-dashboard";
    return "landing";
  }); // landing, room-detail, tenant-dashboard, admin-dashboard
  const [tenantSubTab, setTenantSubTab] = useState<"overview" | "profile" | "bookings" | "payments" | "notifications">(() => {
    const savedSubTab = localStorage.getItem("raikos-tenant-sub-tab");
    return (savedSubTab as any) || "overview";
  });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("raikos-user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentRole, setCurrentRole] = useState<"tenant" | "admin" | null>(() => {
    const savedRole = localStorage.getItem("raikos-role");
    return (savedRole === "tenant" || savedRole === "admin") ? savedRole : null;
  });

  // Modal dialog triggers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    nik: ""
  });
  const [authError, setAuthError] = useState("");

  // Google account chooser mockup states
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleHasPhoto, setCustomGoogleHasPhoto] = useState(true);
  const [isCustomGoogleForm, setIsCustomGoogleForm] = useState(false);

  // Dark/Light Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Toasts message list
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Floating scroll-to-top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Room lookup index mapping
  const roomsLookup = React.useMemo(() => {
    return rooms.reduce((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {} as Record<string, Room>);
  }, [rooms]);

  // Setup Theme Class
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("raikos-dark");
  }, []);

  // Synchronize state with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("raikos-user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("raikos-user");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem("raikos-role", currentRole);
    } else {
      localStorage.removeItem("raikos-role");
    }
  }, [currentRole]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("raikos-active-tab", activeTab);
    } else {
      localStorage.removeItem("raikos-active-tab");
    }
  }, [activeTab]);

  useEffect(() => {
    if (tenantSubTab) {
      localStorage.setItem("raikos-tenant-sub-tab", tenantSubTab);
    } else {
      localStorage.removeItem("raikos-tenant-sub-tab");
    }
  }, [tenantSubTab]);

  // Display toast feedback helper
  const showToast = (message: string, type: ToastType = "success") => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // On page scroll monitoring
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Database on Mount
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch rooms
      
      const roomsRes = await fetch("/api/rooms");
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }

      // Fetch tenants
      const tenantsRes = await fetch("/api/tenants");
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      }

      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        const bkData = await bookingsRes.json();
        setBookings(bkData);
      }

      // Fetch payments
      const paymentsRes = await fetch("/api/payments");
      if (paymentsRes.ok) {
        const pmData = await paymentsRes.json();
        setPayments(pmData);
      }
    } catch (err) {
      console.error("Express API connection fail, utilizing client-side fallback database.", err);
      showToast("Gagal terhubung ke API Server. Menggunakan data memori.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync notifications on active tenant user
  useEffect(() => {
    if (currentUser && currentRole === "tenant") {
      fetch(`/api/notifications/${currentUser.id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data) => setNotifications(data))
        .catch(() => {});
    }
  }, [currentUser, currentRole, bookings, payments]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Authentication Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        setAuthModalOpen(false);
        showToast(`Selamat datang kembali, ${data.user.name}!`, "success");
        
        // Route corresponding tab
        if (data.user.role === "admin") {
          setActiveTab("admin-dashboard");
        } else {
          setActiveTab("tenant-dashboard");
        }
      } else {
        setAuthError(data.message || "Email atau password salah!");
      }
    } catch (err) {
      setAuthError("Gagal terhubung ke modul auth.");
    }
  };

  const handleGoogleLoginSubmit = async (googleUser: { name: string, email: string, googleAvatar: string | null }) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setCurrentRole(data.user.role);
        setAuthModalOpen(false);
        setGoogleChooserOpen(false);
        setIsCustomGoogleForm(false);
        showToast(`Berhasil masuk dengan Google posisi ${data.user.name}!`, "success");
        setActiveTab("tenant-dashboard");
      } else {
        showToast("Masuk dengan akun Google dibatalkan.", "error");
      }
    } catch (err) {
      showToast("Gagal terhubung dengan server Google.", "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    // Simple verification regex
    if (!authForm.nik.match(/^\d{16}$/)) {
      setAuthError("NIK harus berisi 16 digit angka!");
      return;
    }
    if (!authForm.phone.match(/^\d{10,14}$/)) {
      setAuthError("Format nomor HP/WA tidak valid!");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setCurrentRole("tenant");
        setAuthModalOpen(false);
        showToast("Registrasi akun penyewa berhasil! 🎉", "success");
        setActiveTab("tenant-dashboard");
      } else {
        setAuthError(data.message || "Email sudah terdaftar!");
      }
    } catch (err) {
      setAuthError("Gagal menghubungi server registrasi.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveTab("landing");
    showToast("Anda telah keluar dari sistem secara aman.", "info");
  };

  // --- Booking Placement & Pipeline ---
  const handleBookingSubmit = async (bookingData: Partial<Booking>) => {
    if (!currentUser) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingData,
          user_id: currentUser.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local memory and switch tab
        showToast("Pemesanan kos Anda berhasil diajukan! Menunggu pembayaran.", "success");
        fetchAllData();
        setActiveTab("tenant-dashboard");
      } else {
        showToast(data.message || "Gagal membuat pemesanan", "error");
      }
    } catch (err) {
      showToast("Koneksi gagal saat mengajukan pemesanan.", "error");
    }
  };

  // --- Payment submission ---
  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      let res;
      if (paymentData.proof_image instanceof File) {
        const formData = new FormData();
        formData.append("booking_id", paymentData.booking_id);
        formData.append("amount", String(paymentData.amount));
        formData.append("payment_method", paymentData.payment_method);
        formData.append("proof_image", paymentData.proof_image);
        formData.append("billing_month", paymentData.billing_month);
        formData.append("billing_year", paymentData.billing_year);
        formData.append("user_id", currentUser.id);

        res = await fetch("/api/payments", {
          method: "POST",
          body: formData
        });
      } else {
        res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...paymentData,
            meeting_date: paymentData.meeting_date || paymentData.meetup_date,
            user_id: currentUser.id
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          paymentData.payment_method === "Cash Langsung" || paymentData.payment_method === "Cash"
            ? "Janji temu pembayaran Cash berhasil diajukan!"
            : "Bukti pembayaran berhasil diunggah! Sedang diverifikasi.",
          "success"
        );
        fetchAllData();
      } else {
        showToast(data.message || "Gagal menyimpan bukti pembayaran.", "error");
      }
    } catch (err) {
      showToast("Kesalahan koneksi pengunggahan kuitansi.", "error");
    }
  };

  // --- Notifications read triggers ---
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/read/${id}`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/notifications/read-all/${currentUser.id}`, { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("Seluruh kotak masuk ditandai telah dibaca.", "info");
    } catch (err) {}
  };

  // --- Tenant Profile revision ---
  const handleUpdateProfile = async (updatedData: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tenants/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.tenant);
        showToast("Informasi profil Anda sukses direvisi!", "success");
      }
    } catch (err) {
      showToast("Gagal memperbarui profil di server.", "error");
    }
  };


  // --- ADMIN ERP OPERATIONAL CONTROLLERS ---
  const handleAddRoom = async (roomData: Partial<Room>) => {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        showToast("Gedung kamar baru berhasil diregistrasi!", "success");
        fetchAllData();
      }
    } catch (err) {
      showToast("Gagal menyimpan unit ke dalam database.", "error");
    }
  };

  const handleUpdateRoom = async (id: string, roomData: Partial<Room>) => {
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        showToast("Spesifikasi kamar kos berhasil diperbarui!", "success");
        fetchAllData();
      }
    } catch (err) {
      showToast("Gagal merubah unit di database.", "error");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus permanen unit kamar ini dari database?")) return;
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Kamar kos sukses dihapus dari katalog.", "info");
        fetchAllData();
      }
    } catch (err) {
      showToast("Gagal menghapus unit.", "error");
    }
  };

  const handleAddTenant = async (tenantData: Partial<User>) => {
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantData)
      });
      if (res.ok) {
        showToast("KTP Penyewa terverifikasi sukses dimasukkan!", "success");
        fetchAllData();
      }
    } catch (err) {}
  };

  const handleUpdateTenant = async (id: string, tenantData: Partial<User>) => {
    try {
      const res = await fetch(`/api/tenants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tenantData)
      });
      if (res.ok) {
        showToast("Profil penyewa sukses diupdate oleh Admin.", "success");
        fetchAllData();
      }
    } catch (err) {}
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm("Hapus penyewa ini dari database Raikos?")) return;
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Akun penyewa berhasil distop.", "info");
        fetchAllData();
      }
    } catch (err) {}
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Status Reservasi telah diubah ke [${status.toUpperCase()}]`, "success");
        fetchAllData();
      }
    } catch (err) {}
  };

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Bukti pembayaran disetujui [${status.toUpperCase()}]`, "success");
        fetchAllData();
      }
    } catch (err) {}
  };

  const handleResetDB = async () => {
    if (!confirm("Perhatian! Tindakan ini akan mengosongkan seluruh relasi tabel kustom Anda dan memulihkan Seed Data asli Raikos. Lanjutkan?")) return;
    try {
      const res = await fetch("/api/db/reset", { method: "POST" });
      if (res.ok) {
        showToast("Database MySQL terekreasi sukses!", "success");
        fetchAllData();
      }
    } catch (err) {}
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans transition-all duration-300 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Dynamic feedback alerting */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Primary Global Navigation header */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={() => { setAuthMode("login"); setAuthForm({ name:"", email:"", password:"", phone:"", nik:"" }); setAuthError(""); setAuthModalOpen(true); }}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onViewAllNotifications={() => { setActiveTab("tenant-dashboard"); setTenantSubTab("notifications"); }}
      />

      {/* CORE VIEWPORTS GRID ENGINE WITH SMOOTH TRANSITION */}
      <main className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage
                rooms={rooms}
                onSelectRoom={(room) => { setSelectedRoom(room); setActiveTab("room-detail"); }}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {activeTab === "room-detail" && selectedRoom && (
            <motion.div
              key="room-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RoomDetail
                room={selectedRoom}
                onBack={() => setActiveTab("landing")}
                onSubmitBooking={handleBookingSubmit}
                currentUser={currentUser}
                openLoginModal={() => { setAuthMode("login"); setAuthModalOpen(true); }}
              />
            </motion.div>
          )}

          {activeTab === "tenant-dashboard" && currentUser && (
            <motion.div
              key="tenant-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <PenyewaDashboard
                currentUser={currentUser}
                bookings={bookings}
                payments={payments}
                notifications={notifications}
                onUpdateProfile={handleUpdateProfile}
                onSubmitPayment={handlePaymentSubmit}
                onMarkNotificationRead={handleMarkNotificationRead}
                onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
                roomsLookup={roomsLookup}
                activeSubTab={tenantSubTab}
                setActiveSubTab={setTenantSubTab}
                onRefreshData={fetchAllData}
              />
            </motion.div>
          )}

          {activeTab === "admin-dashboard" && currentUser && currentRole === "admin" && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <AdminDashboard
                rooms={rooms}
                tenants={tenants}
                bookings={bookings}
                payments={payments}
                onAddRoom={handleAddRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onAddTenant={handleAddTenant}
                onUpdateTenant={handleUpdateTenant}
                onDeleteTenant={handleDeleteTenant}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onResetDB={handleResetDB}
                onRefreshData={fetchAllData}
              />
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* DUAL MODE AUTHENTICATOR MODAL POPUP */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 max-w-sm w-full rounded-2xl shadow-2xl relative text-left space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-880 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Heading */}
              <div className="space-y-1">
                <span className="font-display font-extrabold text-indigo-600 dark:text-sky-450 tracking-tight text-lg">Raikos Gate</span>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50">
                  {authMode === "login" ? "Masuk ke Akun Anda" : "Buka Registrasi Baru"}
                </h3>
                <p className="text-xs text-slate-400">
                  {authMode === "login" 
                    ? "Masukkan kredensial penyewa / admin terdaftar." 
                    : "Lengkapi KTP nasional Anda untuk registrasi legal sewa kos."}
                </p>
              </div>

              {/* Login/Register selection toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl text-xs sm:text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); }}
                  className={`py-2 rounded-lg text-center transition ${authMode === "login" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("register"); setAuthError(""); }}
                  className={`py-2 rounded-lg text-center transition ${authMode === "register" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                >
                  Registrasi
                </button>
              </div>

              {/* Auth error banner */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-500 text-xs">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form implementation */}
              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4 text-xs font-semibold text-slate-600">
                {authMode === "register" && (
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase mb-1">Nama Lengkap (KTP)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-250 focus:outline-none"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-slate-450 uppercase mb-1">Alamat Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-250 focus:outline-none text-xs"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="contoh@domain.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 uppercase mb-1">Kata Sandi (Password)</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-250 focus:outline-none"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="Minimal 5 abjad"
                    required
                  />
                </div>

                {authMode === "register" && (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] text-slate-450 uppercase mb-1">No HP</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-250 focus:outline-none"
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        placeholder="0812..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-450 uppercase mb-1">NIK (16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-250 focus:outline-none"
                        value={authForm.nik}
                        onChange={(e) => setAuthForm({ ...authForm, nik: e.target.value })}
                        placeholder="3275..."
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-90 transition text-white text-center shadow shadow-indigo-500/10 cursor-pointer"
                >
                  {authMode === "login" ? "Masuk Sekarang" : "Selesaikan Pendaftaran"}
                </button>

                {authMode === "login" && (
                  <>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                      <span className="flex-shrink mx-2 text-slate-400 text-[9px] uppercase tracking-wider font-mono">Atau masuk SSO</span>
                      <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGoogleChooserOpen(true)}
                      className="w-full py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Masuk dengan Google
                    </button>
                  </>
                )}

                {authMode === "login" && (
                  <div className="pt-3 border-t text-center space-y-1 text-[10px] text-slate-400 font-mono leading-none">
                    <p>Demo Penyewa: <span className="font-bold text-indigo-500">penyewa@raikos.com</span> pass: <span className="font-bold text-indigo-500">penyewa</span></p>
                    <p>Demo Admin: <span className="font-bold text-violet-500">admin@raikos.com</span> pass: <span className="font-bold text-violet-500">admin</span></p>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      <AnimatePresence>
        {googleChooserOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white text-slate-850 p-6 sm:p-8 max-w-sm w-full rounded-3xl shadow-2xl relative text-left space-y-6 border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setGoogleChooserOpen(false);
                  setIsCustomGoogleForm(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Google Brand G Logo */}
              <div className="flex flex-col items-center text-center space-y-2">
                <svg className="w-10 h-10 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-100">
                  Pilih Akun Google Anda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  untuk melanjutkan login atau mendaftar ke Raikos
                </p>
              </div>

              {!isCustomGoogleForm ? (
                <div className="space-y-2.5">
                  {[
                    {
                      name: "Budi Santoso",
                      email: "budisantorogoogle@gmail.com",
                      googleAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                    },
                    {
                      name: "Siti Rahma",
                      email: "sitirahmagoogle@gmail.com",
                      googleAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                    },
                    {
                      name: "Gilang Ramadhan",
                      email: "gilang@gmail.com",
                      googleAvatar: null
                    }
                  ].map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGoogleLoginSubmit(acc)}
                      className="w-full p-3 border border-slate-100 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/25 dark:hover:bg-blue-950/20 transition rounded-2xl flex items-center gap-3.5 text-left cursor-pointer"
                    >
                      {acc.googleAvatar ? (
                        <img
                          src={acc.googleAvatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700 shrink-0">
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight truncate">{acc.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{acc.email}</p>
                      </div>
                      <span className="text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-450 font-mono px-2 py-1 rounded-full shrink-0 border border-slate-100 dark:border-slate-750">
                        {acc.googleAvatar ? "Ada Foto" : "Tanpa Foto"}
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCustomGoogleName("");
                      setCustomGoogleEmail("");
                      setCustomGoogleHasPhoto(true);
                      setIsCustomGoogleForm(true);
                    }}
                    className="w-full p-3 border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-850 transition rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Gunakan Akun Google Lain...
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 text-slate-700 dark:text-slate-300">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="Contoh: Andi Wijaya"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Alamat Email Google</label>
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="andi@gmail.com"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-blue-500 text-slate-850 dark:text-slate-200 font-mono font-semibold"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between py-1 px-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Miliki Foto Profil Google</span>
                      <button
                        type="button"
                        onClick={() => setCustomGoogleHasPhoto(!customGoogleHasPhoto)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${customGoogleHasPhoto ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${customGoogleHasPhoto ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => setIsCustomGoogleForm(false)}
                      className="w-1/2 py-2.5 text-center font-bold rounded-xl text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={() => {
                        if (!customGoogleName || !customGoogleEmail) {
                          showToast("Harap isi seluruh isian formulir Google.", "error");
                          return;
                        }
                        const avatarUrl = customGoogleHasPhoto
                          ? `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`
                          : null;
                        handleGoogleLoginSubmit({
                          name: customGoogleName,
                          email: customGoogleEmail,
                          googleAvatar: avatarUrl
                        });
                      }}
                      className="w-1/2 py-2.5 text-center font-bold rounded-xl text-xs text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-350/20 transition cursor-pointer"
                    >
                      Pilih & Masuk
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-slate-400 leading-relaxed pt-2">
                Evaluator: Mockup ini menyimulasikan SSO Google OAuth secara penuh sesuai prasyarat fungsionalitas.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT SCROLL TO TOP BUTTON ACCENT */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 z-30 flex items-center justify-center transition border border-white/5"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
