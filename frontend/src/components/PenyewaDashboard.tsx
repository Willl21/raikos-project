import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, CreditCard, Clock, Bell, Settings, LogOut, CheckCircle, Upload,
  FileText, ShieldCheck, DollarSign, Compass, MessageSquare, AlertCircle, RefreshCw, X,
  Camera, RotateCcw, Trash2
} from "lucide-react";
import { Booking, Payment, Notification, RentalExtension } from "../types";

interface PenyewaDashboardProps {
  currentUser: any;
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  extensions: RentalExtension[];
  onExtendRental: (bookingId: string, durationMonths: number) => void;
  onSetWillNotExtend: (bookingId: string, willNotExtend: boolean) => void;
  onUpdateProfile: (updatedData: any) => void;
  onSubmitPayment: (paymentData: any) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  roomsLookup: any; // ID to Room mapping
  activeSubTab?: "overview" | "profile" | "bookings" | "payments" | "notifications";
  setActiveSubTab?: (tab: "overview" | "profile" | "bookings" | "payments" | "notifications") => void;
  onRefreshData?: () => void;
}

export default function PenyewaDashboard({
  currentUser,
  bookings,
  payments,
  notifications,
  extensions = [],
  onExtendRental,
  onSetWillNotExtend,
  onUpdateProfile,
  onSubmitPayment,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onRefreshData,
  roomsLookup,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab
}: PenyewaDashboardProps) {
  // Lifted or local navigation tabs helper
  const [localActiveSubTab, setLocalActiveSubTab] = useState<"overview" | "profile" | "bookings" | "payments" | "notifications">("overview");
  const activeSubTab = propActiveSubTab !== undefined ? propActiveSubTab : localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab !== undefined ? propSetActiveSubTab : setLocalActiveSubTab;

  // Profile forms state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    nik: currentUser?.nik || "",
    avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    uploadedAvatar: currentUser?.uploadedAvatar || null,
    googleAvatar: currentUser?.googleAvatar || null,
    isGoogleLogin: currentUser?.isGoogleLogin || false
  });

  const [imageError, setImageError] = useState("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;

    // Supported formats check: JPG, JPEG, PNG, WEBP
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Format berkas tidak didukung! Format yang diijinkan: JPG, JPEG, PNG, WEBP.");
      return;
    }

    // Maximum file size check: 5 MB (5 * 1024 * 1024)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Ukuran foto melebihi batas simpan s.d. 5 MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFilePreview(base64String);
      setProfileForm(prev => ({
        ...prev,
        uploadedAvatar: base64String,
        avatar: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!onRefreshData) return;
    const interval = setInterval(() => {
      onRefreshData();
    }, 4000);
    return () => clearInterval(interval);
  }, [onRefreshData]);
  const handleResetToGoogle = () => {
    setImageError("");
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Fall back to google avatar, then to system default
    const googleAv = currentUser?.googleAvatar || null;
    const defaultAv = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

    setProfileForm(prev => ({
      ...prev,
      uploadedAvatar: null,
      avatar: googleAv || defaultAv
    }));
  };

  // State for upload payment proof
  const [uploadPaymentOpen, setUploadPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    bookingId: "",
    extensionId: "",
    amount: 0,
    paymentMethod: "Transfer Bank BCA",
    proofImage: ""
  });
  const [paymentType, setPaymentType] = useState<"transfer" | "cash">("transfer");
  const [meetupDate, setMeetupDate] = useState("");
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);

  // State for renewal modal
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewForm, setRenewForm] = useState({
    bookingId: "",
    roomName: "",
    currentEndDate: "",
    durationMonths: 1
  });

  const openRenewModal = (b: Booking) => {
    const targetRoom = roomsLookup[b.room_id];
    const entryDate = new Date(b.entry_date);
    const endDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + Number(b.duration_months), entryDate.getDate());
    const formattedEndDate = endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    setRenewForm({
      bookingId: b.id,
      roomName: targetRoom ? targetRoom.name : "Kamar No. " + b.room_id,
      currentEndDate: formattedEndDate,
      durationMonths: 1
    });
    setRenewModalOpen(true);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExtendRental(renewForm.bookingId, renewForm.durationMonths);
    setRenewModalOpen(false);
  };

  const selectExtensionForPayment = (ext: RentalExtension) => {
    setPaymentForm({
      bookingId: ext.booking_id,
      extensionId: ext.id,
      amount: Number(ext.amount),
      paymentMethod: "Transfer Bank BCA",
      proofImage: ""
    });
    setPaymentType("transfer");
    setMeetupDate("");
    setProofImageBase64(null);
    setProofImageFile(null);
    setFormError("");
    setUploadPaymentOpen(true);
  };

  // Sync profileForm if user changes
  React.useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name,
        phone: currentUser.phone || "",
        nik: currentUser.nik || "",
        avatar: currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        uploadedAvatar: currentUser.uploadedAvatar || null,
        googleAvatar: currentUser.googleAvatar || null,
        isGoogleLogin: currentUser.isGoogleLogin || false
      });
      setFilePreview(null);
      setImageError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [currentUser]);

  // Filter components to only current logged in user
  const tenantBookings = bookings.filter(b => b.user_id === currentUser?.id);
  const tenantPayments = payments.filter(p => p.user_id === currentUser?.id);
  const tenantNotifs = notifications.filter(n => n.user_id === currentUser?.id);
  const tenantExtensions = extensions.filter(e => e.user_id === currentUser?.id);

  // Ongoing bookings (Pending Approval, Approved but not fully paid, etc.)
  const ongoingBookings = tenantBookings.filter(b =>
    b.status === "Pending Approval" || b.status === "pending" || b.status === "Approved" || b.status === "Rejected" || b.status === "rejected"
  );

  // Active / Completed Rentals (Completed, Expired)
  const activeRentals = tenantBookings.filter(b => b.status === "Completed");
  const expiredRentals = tenantBookings.filter(b => b.status === "Expired");

  // Calculate unPaid/pending billings
  const activeUnPaidBookings = tenantBookings.filter(b => b.status !== "rejected" && b.status !== "Rejected" && b.status !== "Expired");

  // Calculate active billing amount (original + extensions)
  const activeBookingBillingAmount = tenantBookings.reduce((sum, b) => {
    if (b.status === "pending" || b.status === "Pending Approval" || b.status === "rejected" || b.status === "Rejected" || b.status === "Expired") return sum;
    const payment = tenantPayments.find(p => p.booking_id === b.id && !p.extension_id);
    if (payment && payment.status === "Paid") {
      return sum;
    }
    return sum + b.total_price;
  }, 0);

  const activeExtensionBillingAmount = tenantExtensions.reduce((sum, ext) => {
    if (ext.status !== "pending_payment") return sum;
    return sum + ext.amount;
  }, 0);

  const activeBillingAmount = activeBookingBillingAmount + activeExtensionBillingAmount;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      onUpdateProfile(profileForm);
      setSavingProfile(false);
    }, 600);
  };

  const getMaxMeetupDate = (entryDateStr: string) => {
    if (!entryDateStr) return "";
    const d = new Date(entryDateStr);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() - 3);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!paymentForm.bookingId) return;

    const currentBooking = bookings.find(b => b.id === paymentForm.bookingId);

    if (paymentType === "transfer") {
      if (!proofImageFile) {
        setFormError("Silakan upload file bukti pembayaran Anda dari perangkat.");
        return;
      }
      onSubmitPayment({
        booking_id: paymentForm.bookingId,
        extension_id: paymentForm.extensionId || null,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.paymentMethod,
        proof_image: proofImageFile,
        billing_month: new Date().toLocaleString("id-ID", { month: "long" }),
        billing_year: new Date().getFullYear().toString()
      });
    } else {
      if (!meetupDate) {
        setFormError("Silakan pilih tanggal janji ketemu.");
        return;
      }
      const maxDateStr = getMaxMeetupDate(currentBooking?.entry_date || "");
      if (maxDateStr && meetupDate > maxDateStr) {
        setFormError(`Tanggal janji ketemu maksimal H-3 dari tanggal masuk (${currentBooking?.entry_date}). Tanggal maksimal adalah ${maxDateStr}.`);
        return;
      }
      onSubmitPayment({
        booking_id: paymentForm.bookingId,
        extension_id: paymentForm.extensionId || null,
        amount: Number(paymentForm.amount),
        payment_method: "Cash Langsung",
        meetup_date: meetupDate,
        billing_month: new Date().toLocaleString("id-ID", { month: "long" }),
        billing_year: new Date().getFullYear().toString()
      });
    }

    setUploadPaymentOpen(false);
  };

  const selectBookingForPayment = (b: Booking) => {
    setPaymentForm({
      bookingId: b.id,
      extensionId: "",
      amount: b.total_price,
      paymentMethod: "Transfer Bank BCA",
      proofImage: ""
    });
    setPaymentType("transfer");
    setMeetupDate("");
    setProofImageBase64(null);
    setProofImageFile(null);
    setFormError("");
    setUploadPaymentOpen(true);
  };



  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Overview Head line */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="text-left">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-50">
            Halo, {currentUser?.name || "Penyewa"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">
            Selamat datang di portal informasi sewa & administrasi kos terintegrasi Raikos.
          </p>
        </div>

        {/* Notif Quick view */}
        <div className="flex items-center gap-2">
          {tenantNotifs.some(n => !n.is_read) && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
          )}
          <button
            onClick={() => setActiveSubTab("notifications")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-sky-450"
          >
            {tenantNotifs.filter(n => !n.is_read).length} Notifikasi Baru
          </button>
        </div>
      </div>

      {/* Main SaaS Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR TABS PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
            {/* Short Profile preview */}
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                alt="Profile photo"
                className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-inner"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-150 line-clamp-1">{currentUser?.name}</p>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Penyewa Aktif</span>
              </div>
            </div>

            {/* Sub-tab selections */}
            <nav className="flex flex-col gap-1 text-left">
              {[
                { id: "overview", label: "Ringkasan Akun", icon: <Compass className="w-4.5 h-4.5" /> },
                { id: "profile", label: "Profil & KTP", icon: <User className="w-4.5 h-4.5" /> },
                { id: "bookings", label: "Booking Saya", icon: <Clock className="w-4.5 h-4.5" /> },
                { id: "payments", label: "Riwayat & Tagihan", icon: <CreditCard className="w-4.5 h-4.5" /> }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${activeSubTab === sub.id
                    ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-sky-400 border border-indigo-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                    }`}
                >
                  {sub.icon}
                  {sub.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* CONTAINER CONTENT DYNAMICALLY SELECTED */}
        <div className="lg:col-span-3 text-left">
          <AnimatePresence mode="wait">
            {/* Tab: OVERVIEW */}
            {activeSubTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Metrics top */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Total Booking */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Booking</span>
                      <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{tenantBookings.length}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-500 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Tagihan Aktif */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Tagihan Aktif</span>
                      <p className="text-lg font-extrabold text-indigo-600 dark:text-sky-400 mt-1">
                        {activeBillingAmount > 0 ? `Rp ${activeBillingAmount.toLocaleString()}` : "Lunas / Tidak Ada"}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Lunas Pembayaran */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Total Disetor</span>
                      <p className="text-lg font-bold text-emerald-500">
                        Rp {tenantPayments.reduce((acc, p) => p.status === "Paid" ? acc + p.amount : acc, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {/* 1. AKTIVITAS BOOKING TERBARU */}
                {ongoingBookings.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                      Aktivitas Booking
                    </h3>
                    <div className="space-y-4">
                      {ongoingBookings.map(booking => {
                        const targetRoom = roomsLookup[booking.room_id];

                        if (booking.status === "Rejected" || booking.status === "rejected") {
                          return (
                            <div key={booking.id} className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="text-left space-y-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded capitalize bg-rose-100 text-rose-700">
                                  Status: Booking Ditolak
                                </span>
                                <h4 className="font-bold text-sm text-slate-855 dark:text-slate-100 mt-2">
                                  {targetRoom ? targetRoom.name : "Kamar No. " + booking.room_id}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  Silakan cari kamar kos impian Anda yang lain di katalog halaman depan kami.
                                </p>
                              </div>
                            </div>
                          );
                        }

                        if (booking.status === "Pending Approval" || booking.status === "pending") {
                          return (
                            <div key={booking.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="text-left space-y-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded capitalize bg-amber-100 text-amber-700">
                                  Status: Menunggu Persetujuan Booking
                                </span>
                                <h4 className="font-bold text-sm text-slate-855 dark:text-slate-100 mt-2">
                                  {targetRoom ? targetRoom.name : "Kamar No. " + booking.room_id}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  Diajukan pada: {new Date(booking.created_at).toLocaleDateString("id-ID")}
                                </p>
                                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                                  Admin sedang memverifikasi data diri Anda. Harap tunggu persetujuan reservasi sebelum melanjutkan pembayaran.
                                </p>
                              </div>
                              <div className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-2 rounded-xl shrink-0">
                                Menunggu Verifikasi Admin
                              </div>
                            </div>
                          );
                        }

                        if (booking.status === "Approved") {
                          const alreadyPaid = tenantPayments.find(p => p.booking_id === booking.id && !p.extension_id);
                          const isPaidPending = alreadyPaid && (alreadyPaid.status === "pending" || alreadyPaid.status === "Waiting Verification");
                          const isPaidRejected = alreadyPaid && (alreadyPaid.status === "rejected" || alreadyPaid.status === "Rejected");

                          return (
                            <div key={booking.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="text-left space-y-1">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${isPaidPending ? "bg-amber-100 text-amber-750" : isPaidRejected ? "bg-rose-100 text-rose-750" : "bg-indigo-100 text-indigo-750"
                                  }`}>
                                  Status: {isPaidPending ? "Menunggu Verifikasi Pembayaran" : isPaidRejected ? "Pembayaran Ditolak" : "Menunggu Pembayaran"}
                                </span>
                                <h4 className="font-bold text-sm text-slate-855 dark:text-slate-100 mt-2">
                                  {targetRoom ? targetRoom.name : "Kamar No. " + booking.room_id}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">Tgl Masuk: {booking.entry_date} ({booking.duration_months} bln)</p>
                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-205 mt-0.5">
                                  Jumlah tagihan: Rp {booking.total_price.toLocaleString()}
                                </p>

                                {isPaidPending && (
                                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold mt-1">
                                    Bukti pembayaran Anda sedang diperiksa oleh admin
                                  </p>
                                )}
                                {isPaidRejected && (
                                  <p className="text-[10px] text-rose-600 dark:text-rose-455 font-semibold mt-1">
                                    Pembayaran ditolak. Silakan unggah ulang bukti pembayaran yang valid.
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 mt-3 sm:mt-0">
                                {isPaidPending ? (
                                  <div className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3.5 py-2 rounded-xl">
                                    Verifikasi Pembayaran
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => selectBookingForPayment(booking)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:opacity-90 rounded-xl shadow transition cursor-pointer"
                                  >
                                    Lakukan Pembayaran
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                )}

                {/* 2. STATUS HUNIAN AKTIF */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                    Status Hunian Aktif Anda
                  </h3>

                  {activeRentals.length === 0 && expiredRentals.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                      <Compass className="w-10 h-10 text-slate-350" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-405 uppercase font-mono tracking-wider font-bold">Status: Belum Menyewa</p>
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">Anda belum memiliki hunian aktif</h4>
                        <p className="text-slate-400 text-xs mt-0.5">Silakan cari kamar kos impian Anda di katalog halaman depan kami.</p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem("raikos-active-tab", "landing");
                          window.location.href = "/";
                        }}
                        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        Cari Kamar
                      </button>
                    </div>
                  )}

                  <div className="space-y-6">
                    {activeRentals.map(booking => {
                      const targetRoom = roomsLookup[booking.room_id];
                      const entryDate = new Date(booking.entry_date);
                      const endDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + Number(booking.duration_months), entryDate.getDate());
                      const todayDate = new Date();
                      todayDate.setHours(0, 0, 0, 0);
                      const endDateCopy = new Date(endDate);
                      endDateCopy.setHours(0, 0, 0, 0);
                      const diffTime = endDateCopy.getTime() - todayDate.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      const formattedEntryDate = entryDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                      const formattedEndDate = endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

                      return (
                        <div key={booking.id} className="space-y-4">
                          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                              <div className="text-left">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider font-mono">
                                  Status: Penghuni Aktif
                                </span>
                                <h4 className="font-bold text-sm text-slate-855 dark:text-slate-100 mt-2">
                                  {targetRoom ? targetRoom.name : "Kamar No. " + booking.room_id}
                                </h4>
                              </div>
                              {targetRoom?.images?.[0] && (
                                <img
                                  src={targetRoom.images[0]}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-100 dark:border-slate-800 shrink-0"
                                  alt="Room thumbnail"
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left text-xs leading-relaxed">
                              <div>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono">Tanggal Masuk</p>
                                <p className="font-bold text-slate-805 dark:text-slate-200 mt-0.5">{formattedEntryDate}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono">Durasi Sewa</p>
                                <p className="font-bold text-slate-805 dark:text-slate-200 mt-0.5">{booking.duration_months} Bulan</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono">Tanggal Selesai</p>
                                <p className="font-bold text-slate-805 dark:text-slate-200 mt-0.5">{formattedEndDate}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider font-mono">Sisa Hari Sewa</p>
                                <p className={`font-bold mt-0.5 ${diffDays <= 7 ? "text-rose-500 font-extrabold animate-pulse" : "text-emerald-500"}`}>
                                  {diffDays > 0 ? `${diffDays} Hari` : "Habis"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {diffDays <= 7 && (
                            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                              <div className="space-y-1">
                                <h5 className="font-bold text-amber-850 dark:text-amber-400 text-xs flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                  Masa sewa anda akan segera selesai
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-slate-405 leading-normal">
                                  Masa sewa kamar Anda tersisa {diffDays} hari lagi. Tentukan apakah Anda ingin memperpanjang masa sewa atau tidak.
                                </p>
                              </div>

                              {booking.will_not_extend ? (
                                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3.5 py-2 rounded-xl shrink-0">
                                  Opsi: Tidak Perpanjang
                                </span>
                              ) : (() => {
                                // Find active extension for this booking
                                const activeExt = extensions.find(e =>
                                  e.booking_id === booking.id &&
                                  ["pending", "approved", "waiting_verification"].includes(e.status)
                                );
                                if (activeExt) {
                                  // Show status badge instead of button
                                  const label =
                                    activeExt.status === "pending" ? "Pengajuan Menunggu Persetujuan Admin ⏳" :
                                      activeExt.status === "approved" ? "Disetujui — Silakan Bayar ✅" :
                                        "Pembayaran Sedang Diverifikasi 🔍";
                                  const colorClass =
                                    activeExt.status === "pending" ? "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400" :
                                      activeExt.status === "approved" ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400" :
                                        "text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400";
                                  return (
                                    <span className={`text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 border ${colorClass}`}>
                                      {label}
                                    </span>
                                  );
                                }
                                return (
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() => openRenewModal(booking)}
                                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition shadow-sm cursor-pointer"
                                    >
                                      Perpanjang Sewa
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Apakah Anda yakin tidak ingin memperpanjang masa sewa kamar ini? Anda tetap memiliki hak tinggal sampai tanggal selesai.")) {
                                          onSetWillNotExtend(booking.id, true);
                                        }
                                      }}
                                      className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                                    >
                                      Tidak Perpanjang
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Render Expired Rentals here as well */}
                    {expiredRentals.map(booking => {
                      const targetRoom = roomsLookup[booking.room_id];
                      return (
                        <div key={booking.id} className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                          <Compass className="w-10 h-10 text-slate-350" />
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Status: Masa Sewa Berakhir</p>
                            <h4 className="font-bold text-slate-700 dark:text-slate-300">Masa sewa kamar Anda telah berakhir</h4>
                            <p className="text-slate-405 text-xs mt-0.5">Terima kasih telah menyewa kamar {targetRoom?.name || ""} di Raikos.</p>
                          </div>
                          <button
                            onClick={() => {
                              localStorage.setItem("raikos-active-tab", "landing");
                              window.location.href = "/";
                            }}
                            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-770 rounded-xl shadow-sm transition cursor-pointer mt-2"
                          >
                            Sewa Kamar Baru
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: PROFILE */}
            {activeSubTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                    Informasi Profil & KTP Penyewa
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan jaga data Anda tetap akurat untuk mempermudah verifikasi legalitas dan pembuatan kuitansi sewa berkala.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* FOTO PROFIL BOARD & PRIORITAS SISTEM */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Foto Profil Pengguna (Sinkronisasi & Prioritas)
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Avatar Preview */}
                      <div className="relative group shrink-0">
                        <img
                          src={profileForm.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                          alt="Pratinjau Foto Profil"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-100 dark:border-slate-800 shadow-md transition-transform group-hover:scale-[1.02] duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transition-all scale-95 hover:scale-105"
                          title="Ubah Foto Profil"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info & Action Controls */}
                      <div className="flex-grow text-center sm:text-left space-y-2">
                        {/* Interactive Buttons */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                          {/* Choose file native trigger */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Ubah Foto Profil
                          </button>

                          {/* Revert to Google Button (Only active/meaningful if user has google status) */}
                          {profileForm.isGoogleLogin && (
                            <button
                              type="button"
                              onClick={handleResetToGoogle}
                              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              title="Kembali gunakan foto dari Akun Google"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Gunakan Foto Google
                            </button>
                          )}
                        </div>

                        {/* File details */}
                        <p className="text-[10px] text-slate-405 leading-relaxed">
                          Mendukung berkas: PNG, JPG, JPEG, WEBP. Maksimal ukuran 5 MB.
                        </p>
                      </div>
                    </div>

                    {/* Image error validation alert */}
                    {imageError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{imageError}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor HP</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NIK 16 Digit (KTP)</label>
                    <input
                      type="text"
                      maxLength={16}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                      value={profileForm.nik}
                      onChange={(e) => setProfileForm({ ...profileForm, nik: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-2.5 font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-xl shadow hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Tab: BOOKINGS RECORD */}
            {activeSubTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                    Riwayat Pengajuan Booking Kamar
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Berikut seluruh riwayat pemesanan kamar kos yang pernah Anda ajukan di Raikos.
                  </p>
                </div>

                {tenantBookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">Belum ada pemesanan.</div>
                ) : (
                  <div className="space-y-4">
                    {tenantBookings.map((b) => (
                      <div key={b.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                        <div className="text-left space-y-1">
                          <p className="text-xs font-mono font-bold text-indigo-500 uppercase">{b.id}</p>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-150">
                            {roomsLookup[b.room_id]?.name || "Kamar ID " + b.room_id}
                          </h4>
                          <p className="text-xs text-slate-400">Durasi: {b.duration_months} Bulan — Tgl Masuk: {b.entry_date}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">Total Biaya: Rp {b.total_price.toLocaleString()}</p>
                        </div>

                        <div className="flex flex-col sm:items-end justify-between">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${(b.status === "Approved" || b.status === "Completed")
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                            : (b.status === "rejected" || b.status === "Rejected")
                              ? "bg-rose-50 text-rose-500 dark:bg-rose-950/20"
                              : "bg-amber-50 text-amber-500 dark:bg-amber-950/20"
                            }`}>
                            {(b.status === "Approved") ? "Disetujui" : b.status === "Completed" ? "Selesai" : (b.status === "rejected" || b.status === "Rejected") ? "Ditolak" : "Menunggu Persetujuan"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">
                            Diajukan: {new Date(b.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: PAYMENTS VIEW */}
            {activeSubTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Active Billing Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                    Sewa & Pembayaran Aktif
                  </h3>

                  {activeUnPaidBookings.length === 0 && tenantExtensions.filter(e => e.status !== "approved").length === 0 ? (
                    <p className="text-xs text-slate-400 text-left">Tidak ada tagihan atau booking aktif.</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Active Bookings (Standard) */}
                      {activeUnPaidBookings.map(b => {
                        const alreadyPaid = tenantPayments.find(p => p.booking_id === b.id && !p.extension_id);

                        const isPendingBooking = b.status === "pending" || b.status === "Pending Approval";
                        const isPaidApproved = alreadyPaid && alreadyPaid.status === "Paid";
                        const isPaidPending = alreadyPaid && (alreadyPaid.status === "pending" || alreadyPaid.status === "Waiting Verification");
                        const isPaidRejected = alreadyPaid && alreadyPaid.status === "Rejected";

                        return (
                          <div key={b.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                            <div className="text-left space-y-0.5">
                              <p className="text-xs font-bold text-slate-750 dark:text-slate-300">Sewa Baru: {roomsLookup[b.room_id]?.name || "Kamar"}</p>
                              <p className="text-[10px] text-slate-405">Periode: {b.entry_date} ({b.duration_months} bln)</p>

                              {isPendingBooking ? (
                                null
                              ) : isPaidApproved ? (
                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-205">Jumlah tagihan: Rp 0</p>
                              ) : (
                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-205">Jumlah tagihan: Rp {b.total_price.toLocaleString()}</p>
                              )}

                              {isPaidPending && (
                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                                  Bukti pembayaran Anda sedang diperiksa oleh admin
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {isPendingBooking ? (
                                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg">
                                  Menunggu Persetujuan Booking
                                </span>
                              ) : isPaidApproved ? (
                                <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                  Pembayaran Lunas
                                </span>
                              ) : isPaidPending ? (
                                <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                                  Menunggu Verifikasi Pembayaran
                                </span>
                              ) : (
                                <>
                                  {isPaidRejected ? (
                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
                                      Pembayaran Ditolak
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg">
                                      Menunggu Pembayaran
                                    </span>
                                  )}
                                  <button
                                    onClick={() => selectBookingForPayment(b)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:opacity-90 rounded-lg shadow-sm cursor-pointer"
                                  >
                                    Lakukan Pembayaran
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Active Extensions */}
                      {tenantExtensions
                        .filter(ext => ext.status !== 'completed')  // hide fully completed ones
                        .map(ext => {
                          const targetRoom = roomsLookup[ext.room_id];
                          const isPending = ext.status === "pending";              // waiting Admin approval
                          const isAdminApproved = ext.status === "approved";       // Admin approved, need to pay
                          const isPaidPending = ext.status === "waiting_verification"; // payment uploaded, wait verify
                          const isPaidRejected = ext.status === "rejected";        // Admin rejected the extension request

                          return (
                            <div key={ext.id} className="p-4 rounded-xl bg-violet-50/20 dark:bg-slate-950 border border-violet-100/30 dark:border-slate-850 flex items-center justify-between">
                              <div className="text-left space-y-0.5">
                                <p className="text-xs font-bold text-slate-750 dark:text-slate-350">
                                  Perpanjangan: {targetRoom?.name || "Kamar"}
                                </p>
                                <p className="text-[10px] text-slate-405">Tambahan Durasi: +{ext.duration_months} Bulan</p>
                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-205">
                                  Jumlah tagihan: Rp {ext.amount.toLocaleString()}
                                </p>
                                {isPending && (
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                                    ⏳ Menunggu persetujuan Admin…
                                  </p>
                                )}
                                {isAdminApproved && (
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                    ✅ Disetujui Admin — Silakan lakukan pembayaran!
                                  </p>
                                )}
                                {isPaidPending && (
                                  <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold mt-1">
                                    Bukti pembayaran perpanjangan sedang diverifikasi admin
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1.5">
                                {isPending ? (
                                  <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                                    Menunggu Persetujuan Admin
                                  </span>
                                ) : isPaidPending ? (
                                  <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                                    Menunggu Verifikasi
                                  </span>
                                ) : isPaidRejected ? (
                                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
                                    Pengajuan Ditolak Admin
                                  </span>
                                ) : isAdminApproved ? (
                                  <button
                                    onClick={() => selectExtensionForPayment(ext)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:opacity-90 rounded-lg shadow-sm cursor-pointer"
                                  >
                                    Lakukan Pembayaran
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Historic list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                    Riwayat Transaksi Masuk
                  </h3>

                  {tenantPayments.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada riwayat pembayaran terekam.</p>
                  ) : (
                    <div className="space-y-3">
                      {tenantPayments.map(p => (
                        <div key={p.id} className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                          <div className="text-left">
                            <p className="font-bold text-slate-800 dark:text-slate-150">{p.payment_method}</p>
                            <p className="text-[10px] text-slate-400">Sewa Bulan {p.billing_month} {p.billing_year}</p>
                            <span className="font-mono text-[10px] text-slate-400">ID: {p.id}</span>
                          </div>

                          <div className="text-right space-y-1">
                            <p className="font-bold text-slate-900 dark:text-slate-50">Rp {p.amount.toLocaleString()}</p>
                            <span className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold ${(p.status === "Paid")
                              ? "bg-emerald-100 text-emerald-800"
                              : (p.status === "rejected" || p.status === "Rejected")
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-850"
                              }`}>
                              {p.status === "Paid" ? "Lunas" : p.status === "Waiting Verification" ? "Menunggu Verifikasi" : p.status === "Rejected" ? "Ditolak" : p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab: NOTIFICATIONS BOX */}
            {activeSubTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                      Kotak Masuk Notifikasi Anda
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pantau konfirmasi pemesanan, tagihan aktif, dan event penting kos di sini.</p>
                  </div>

                  {tenantNotifs.some(n => !n.is_read) && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs font-bold text-indigo-600 dark:text-sky-400 hover:underline"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                {tenantNotifs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Bell className="w-8 h-8 text-slate-300" />
                    <p className="text-xs">Kotak masuk notifikasi Anda bersih!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tenantNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && onMarkNotificationRead(n.id)}
                        className={`p-4 rounded-2xl border transition-all text-left relative ${n.is_read
                          ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60"
                          : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 cursor-pointer hover:bg-indigo-50"
                          }`}
                      >
                        {!n.is_read && (
                          <span className="absolute top-4 right-4 h-2 w-2 bg-indigo-600 rounded-full" />
                        )}

                        <div className="space-y-1 pr-6">
                          <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                            {n.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 pt-1 font-mono">
                            {new Date(n.created_at).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* UPLOAD PAYMENT MODAL POPUP */}
      <AnimatePresence>
        {uploadPaymentOpen && (
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Kirim Bukti Pembayaran
                </h3>
                <button
                  onClick={() => setUploadPaymentOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs sm:text-sm">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl font-medium text-xs border border-rose-100 dark:border-rose-900/30">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Tipe Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType("transfer");
                        setPaymentForm({ ...paymentForm, paymentMethod: "Transfer Bank BCA" });
                        setFormError("");
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${paymentType === "transfer"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                        : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-850"
                        }`}
                    >
                      Transfer Bank / E-Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType("cash");
                        setPaymentForm({ ...paymentForm, paymentMethod: "Cash Langsung" });
                        setFormError("");
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${paymentType === "cash"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/40"
                        : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-850"
                        }`}
                    >
                      Cash (Tunai Langsung)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah Setoran (Rp)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none text-slate-800 dark:text-slate-150"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    disabled
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Jumlah disesuaikan otomatis dengan harga sewa kamar Anda.
                  </p>
                </div>

                {paymentType === "transfer" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Bank / E-Wallet Tujuan</label>
                      <select
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      >
                        <option value="Transfer Bank BCA"> Transfer Bank BCA ( 2303081585 a/n Rainhard Costa Panangian)</option>
                        <option value="Dana / Gopay">Transfer E-Wallet Dana / Gopay (0852-1731-2670)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Upload File Bukti Transfer (dari Device)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none text-slate-800 dark:text-slate-150"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProofImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProofImageBase64(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setProofImageFile(null);
                            setProofImageBase64(null);
                          }
                        }}
                        required
                      />
                      {proofImageBase64 && (
                        <div className="mt-2 p-1 border rounded-lg bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
                          <p className="text-[10px] text-slate-400 mb-1">Pratinjau File:</p>
                          <img src={proofImageBase64} alt="Pratinjau" className="max-h-32 object-contain rounded" />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Janji Ketemu (Maksimal H-3)</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-150 focus:outline-none focus:border-indigo-500"
                      value={meetupDate}
                      onChange={(e) => setMeetupDate(e.target.value)}
                      max={getMaxMeetupDate(bookings.find(b => b.id === paymentForm.bookingId)?.entry_date || "")}
                      required
                    />
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 leading-normal">
                      * Sesuai tanggal masuk kamar Anda ({bookings.find(b => b.id === paymentForm.bookingId)?.entry_date || "belum diatur"}), janji temu pembayaran cash wajib dilakukan maksimal 3 hari sebelumnya (H-3). Tanggal maksimal: {getMaxMeetupDate(bookings.find(b => b.id === paymentForm.bookingId)?.entry_date || "") || "-"}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadPaymentOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:opacity-90 shadow cursor-pointer"
                  >
                    {paymentType === "transfer" ? "Unggah Sekarang" : "Ajukan Janji Temu"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENEW RENTAL MODAL POPUP */}
      <AnimatePresence>
        {renewModalOpen && (
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Perpanjang Sewa Kamar
                </h3>
                <button
                  onClick={() => setRenewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-405 mb-1">Nama Kamar</label>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{renewForm.roomName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-405 mb-1">Masa Sewa Sekarang</label>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {tenantBookings.find(b => b.id === renewForm.bookingId)?.duration_months} Bulan
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-405 mb-1">Tanggal Selesai Sekarang</label>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{renewForm.currentEndDate}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Durasi Perpanjangan</label>
                  <select
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-150 font-semibold"
                    value={renewForm.durationMonths}
                    onChange={(e) => setRenewForm({ ...renewForm, durationMonths: Number(e.target.value) })}
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>12 Bulan</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100/50 dark:border-slate-850 text-left">
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Estimasi Tagihan Baru</p>
                  <div className="flex justify-between items-center mt-1.5">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Harga sewa bulanan:
                    </p>
                    <p className="text-xs font-bold text-slate-750 dark:text-slate-205">
                      Rp {(() => {
                        const b = tenantBookings.find(bk => bk.id === renewForm.bookingId);
                        return b ? (roomsLookup[b.room_id]?.price_monthly || 0).toLocaleString() : 0;
                      })()}/bln
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Total Pembayaran:</p>
                    <p className="text-sm font-extrabold text-indigo-650 dark:text-sky-400">
                      Rp {(() => {
                        const b = tenantBookings.find(bk => bk.id === renewForm.bookingId);
                        return b ? ((roomsLookup[b.room_id]?.price_monthly || 0) * renewForm.durationMonths).toLocaleString() : 0;
                      })()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRenewModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:opacity-90 shadow cursor-pointer"
                  >
                    Ajukan Perpanjangan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
