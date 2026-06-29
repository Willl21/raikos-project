import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building as BuildingIcon, Users as UsersIcon, FileText as FileTextIcon, 
  Landmark as LandmarkIcon, ShieldCheck as ShieldCheckIcon, Plus as PlusIcon, 
  Trash2 as Trash2Icon, Edit as EditIcon, Search as SearchIcon, Check as CheckIcon, 
  X as XIcon, FileSpreadsheet as FileSpreadsheetIcon, FileDown as FileDownIcon, 
  Database as DatabaseIcon, Link as LinkIcon, ArrowRight as ArrowRightIcon, 
  Sparkles as SparklesIcon, RefreshCw as RefreshCwIcon, Eye as EyeIcon, 
  Clock as ClockIcon, DollarSign as DollarSignIcon, CheckCircle2, AlertTriangle,
  Upload
} from "lucide-react";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, AreaChart, Area 
} from "recharts";
import { Room, User, Booking, Payment, Notification } from "../types";

interface AdminDashboardProps {
  rooms: Room[];
  tenants: User[];
  bookings: Booking[];
  payments: Payment[];
  onAddRoom: (roomData: Partial<Room>) => void;
  onUpdateRoom: (id: string, roomData: Partial<Room>) => void;
  onDeleteRoom: (id: string) => void;
  onAddTenant: (tenantData: Partial<User>) => void;
  onUpdateTenant: (id: string, tenantData: Partial<User>) => void;
  onDeleteTenant: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: string) => void;
  onUpdatePaymentStatus: (id: string, status: string) => void;
  onResetDB: () => void;
}

export default function AdminDashboard({
  rooms,
  tenants,
  bookings,
  payments,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onUpdateBookingStatus,
  onUpdatePaymentStatus,
  onResetDB
}: AdminDashboardProps) {
  // Navigation active tab inside ERP
  const [erpTab, setErpTab] = useState<"stats" | "rooms" | "tenants" | "bookings" | "payments" | "reports">("stats");

  // Filter keys inside lists
  const [roomFilter, setRoomFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");

  // Room modal CRUD states
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomEditMode, setRoomEditMode] = useState<"add" | "edit">("add");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [roomForm, setRoomForm] = useState({
    name: "",
    type: "Kamar Mandi Dalam",
    price_monthly: 1500000,
    price_yearly: 16500000,
    description: "",
    status: "tersedia",
    wifi: true,
    bathroom_inside: true,
    electricity_token: true,
    water_independent: true,
    lrt_nearby: true,
    parking_area: true,
    security: true,
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
  });

  const [uploadError, setUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Tenant modal CRUD states
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [tenantEditMode, setTenantEditMode] = useState<"add" | "edit">("add");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [tenantForm, setTenantForm] = useState({
    name: "",
    email: "",
    phone: "",
    nik: "",
    password: "penyewa"
  });

  // Filter lists in real-time
  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(roomFilter.toLowerCase()) || r.type.toLowerCase().includes(roomFilter.toLowerCase()));
  const filteredTenants = tenants.filter(t => t.name.toLowerCase().includes(tenantFilter.toLowerCase()) || t.email.toLowerCase().includes(tenantFilter.toLowerCase()));

  // ERD schema documentation copy text
  const [copiedSql, setCopiedSql] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Stats calculation
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === "tersedia").length;
  const occupiedRooms = rooms.filter(r => r.status === "terisi").length;
  const bookedRooms = rooms.filter(r => r.status === "dipesan" || r.status === "BOOKED").length;
  const totalTenantsCount = tenants.length;
  const totalPendapatan = payments.reduce((acc, p) => p.status === "approved" ? acc + p.amount : acc, 0);

  // Static Data mapping for Charts
  const occupancyChartData = [
    { name: "Tersedia", value: availableRooms, color: "#10b981" },
    { name: "Dipesan", value: bookedRooms, color: "#f59e0b" },
    { name: "Terisi", value: occupiedRooms, color: "#64748b" }
  ];

  const financialChartData = [
    { name: "Jan", pendapatan: 8200000 },
    { name: "Feb", pendapatan: 10400000 },
    { name: "Mar", pendapatan: 12100000 },
    { name: "Apr", pendapatan: 15400000 },
    { name: "Mei", pendapatan: 19800000 },
    { name: "Jun", pendapatan: totalPendapatan > 0 ? totalPendapatan : 22500000 }
  ];

  // Room details lookup for table listings
  const getRoomName = (id: string) => {
    const r = rooms.find(room => room.id === id);
    return r ? r.name : "Kamar ID " + id;
  };

  const getTenantName = (id: string) => {
    const t = tenants.find(tenant => tenant.id === id);
    return t ? t.name : "Penyewa ID " + id;
  };

  // Trigger modal handlers for room
  const openAddRoom = () => {
    setUploadError("");
    setRoomEditMode("add");
    setRoomForm({
      name: "",
      type: "Kamar Mandi Dalam",
      price_monthly: 1500000,
      price_yearly: 16500000,
      description: "Kamar kos modern dengan tempat tidur luas, AC dingin, Wi-Fi berkecepatan tinggi, dan penataan sirkulasi udara luar biasa.",
      status: "tersedia",
      wifi: true,
      bathroom_inside: true,
      electricity_token: true,
      water_independent: true,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
    });
    setIsRoomModalOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setUploadError("");
    setRoomEditMode("edit");
    setSelectedRoomId(room.id);
    setRoomForm({
      name: room.name,
      type: room.type,
      price_monthly: room.price_monthly,
      price_yearly: room.price_yearly,
      description: room.description,
      status: room.status,
      wifi: room.wifi,
      bathroom_inside: room.bathroom_inside,
      electricity_token: room.electricity_token,
      water_independent: room.water_independent,
      lrt_nearby: room.lrt_nearby,
      parking_area: room.parking_area,
      security: room.security,
      imageUrl: room.images[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
    });
    setIsRoomModalOpen(true);
  };

  const handleImageFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format file tidak didukung! Harus berupa JPG, JPEG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar! Maksimal 5 MB.");
      return;
    }
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRoomForm(prev => ({ ...prev, imageUrl: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...roomForm,
      images: [roomForm.imageUrl]
    };

    if (roomEditMode === "add") {
      onAddRoom(dataToSend);
    } else {
      onUpdateRoom(selectedRoomId, dataToSend);
    }
    setIsRoomModalOpen(false);
  };

  // Trigger modal handlers for tenant
  const openAddTenant = () => {
    setTenantEditMode("add");
    setTenantForm({
      name: "",
      email: "",
      phone: "",
      nik: "",
      password: "penyewa"
    });
    setIsTenantModalOpen(true);
  };

  const openEditTenant = (t: User) => {
    setTenantEditMode("edit");
    setSelectedTenantId(t.id);
    setTenantForm({
      name: t.name,
      email: t.email,
      phone: t.phone || "",
      nik: t.nik || "",
      password: "penyewa"
    });
    setIsTenantModalOpen(true);
  };

  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenantEditMode === "add") {
      onAddTenant(tenantForm);
    } else {
      onUpdateTenant(selectedTenantId, tenantForm);
    }
    setIsTenantModalOpen(false);
  };

  // Copy standard MySQL structures to clipboard
  const handleCopySql = () => {
    const rawSql = `
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'tersedia'
);`;
    navigator.clipboard.writeText(rawSql.trim());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Mock reporting generator trigger (generates scannable download logs or prints)
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  
  const generateReportInfo = (type: string) => {
    setDownloadingReport(type);
    setTimeout(() => {
      setDownloadingReport(null);
      alert(`Sukses mengunduh spreadsheet otomatis: Raikos_Laporan_${type}_(${new Date().toLocaleDateString()}).csv`);
    }, 1200);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ERP Title Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider font-mono border border-violet-200/50">
            <SparklesIcon className="w-3.5 h-3.5" />
            Sistem ERP Admin Premium
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-50 mt-2">
            Raikos Management Center (RMC)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
            Kelola operasional kamar, transaksi keuangan, dan laporan pendapatan.
          </p>
        </div>

        {/* Database Quick Action panel */}
        <button
          onClick={onResetDB}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-rose-500 font-semibold rounded-xl flex items-center justify-center gap-1.5"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
          Reset & Seed Database
        </button>
      </div>

      {/* Primary ERP navigation bar */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 mb-8 overflow-x-auto">
        <div className="flex gap-4">
          {[
            { id: "stats", label: "Dashboard", icon: <LandmarkIcon className="w-4 h-4" /> },
            { id: "rooms", label: "Kelola Kamar", icon: <BuildingIcon className="w-4 h-4" /> },
            { id: "tenants", label: "Kelola Penyewa", icon: <UsersIcon className="w-4 h-4" /> },
            { id: "bookings", label: "Kelola Pemesanan", icon: <ClockIcon className="w-4 h-4" /> },
            { id: "payments", label: "Kelola Pembayaran", icon: <DollarSignIcon className="w-4 h-4" /> },
            { id: "reports", label: "Laporan", icon: <FileSpreadsheetIcon className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setErpTab(tab.id as any)}
              className={`flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                erpTab === tab.id
                  ? "border-violet-600 text-violet-600 dark:border-sky-400 dark:text-sky-450"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERP VIEWPORTS AREA */}
      <div>
        <AnimatePresence mode="wait">
          {/* Subview: STATS & ANALYTICS */}
          {erpTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Info Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
                {[
                  { title: "Total Unit Kamar", value: totalRooms, color: "text-blue-500", desc: "Kapasitas ketersediaan" },
                  { title: "Sewa Terisi (Occupied)", value: occupiedRooms, color: "text-slate-650 dark:text-slate-200", desc: "Penghuni aktif" },
                  { title: "Kamar Vacant (Tersedia)", value: availableRooms, color: "text-emerald-500", desc: "Siap dipesan" },
                  { title: "Total Penyewa", value: totalTenantsCount, color: "text-violet-500", desc: "Terdata di KTP" },
                  { title: "Realisasi Kas Masuk", value: `Rp ${totalPendapatan.toLocaleString()}`, color: "text-indigo-600 dark:text-sky-400", desc: "Pembayaran terverifikasi" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">{stat.title}</p>
                    <p className={`text-2xl font-extrabold mt-1.5 ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{stat.desc}</p>
                  </div>
                ))}
              </div>

              {/* Graphic charts Recharts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Financial Area Chart (Col 8) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-150">
                    Realisasi Pendapatan Kos Bulanan (2026)
                  </h3>
                  <div className="h-72 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={financialChartData}>
                        <defs>
                          <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => `Rp ${v/1000000}M`} />
                        <Tooltip formatter={(value: any) => [`Rp ${value.toLocaleString()}`, "Kas Masuk"]} />
                        <Area type="monotone" dataKey="pendapatan" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientIncome)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Occupancy Pie Chart (Col 4) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-150">
                    Rasio Okupansi Kamar
                  </h3>
                  <div className="h-56 w-full flex items-center justify-center text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {occupancyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legends */}
                  <div className="flex justify-around text-xs mt-2 border-t border-slate-50 pt-3">
                    {occupancyChartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-medium text-slate-600 dark:text-slate-350">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Subview: ROOM CATALOG CRUD */}
          {erpTab === "rooms" && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
            >
              {/* Filtering & actions bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-150 pt-2 pb-4">
                <div className="relative flex-grow max-w-sm">
                  <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari kamar berdasarkan nama..."
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  onClick={openAddRoom}
                  className="px-4 py-2 font-semibold text-xs bg-violet-600 hover:opacity-90 text-white rounded-xl shadow flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Kamar Baru
                </button>
              </div>

              {/* Rooms Lists Table */}
              <div className="overflow-x-auto text-left">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-450 uppercase tracking-widest font-bold">
                      <th className="py-3 px-4">Nama Kamar</th>
                      <th className="py-3 px-4">Kategori Mandi</th>
                      <th className="py-3 px-4 font-right">Harga Bulanan</th>
                      <th className="py-3 px-4">Fasilitas</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-805 dark:text-slate-150">
                          {room.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{room.type}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                          Rp {room.price_monthly.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 text-slate-400">
                            {room.wifi && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-bold scale-90">Wi-Fi</span>}
                            {room.bathroom_inside && <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-500 font-bold scale-90">KM Dalam</span>}
                            {room.electricity_token && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-500 font-bold scale-90">Token</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            room.status === "tersedia" 
                              ? "bg-emerald-100 text-emerald-800"
                              : room.status === "BOOKED"
                              ? "bg-indigo-100 text-indigo-800"
                              : room.status === "dipesan"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-650"
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => openEditRoom(room)}
                            className="p-1 px-2.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center gap-1 font-semibold"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteRoom(room.id)}
                            className="p-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Hapus unit"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Subview: TENANTS REGISTRAR */}
          {erpTab === "tenants" && (
            <motion.div
              key="tenants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
            >
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-150 pt-2 pb-4">
                <div className="relative flex-grow max-w-sm">
                  <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama penyewa / email..."
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  onClick={openAddTenant}
                  className="px-4 py-2 font-semibold text-xs bg-violet-600 hover:opacity-90 text-white rounded-xl shadow flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Penyewa (KTP)
                </button>
              </div>

              {/* Tenants list table */}
              <div className="overflow-x-auto text-left">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-450 uppercase font-bold text-slate-400">
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">No HP</th>
                      <th className="py-3 px-4">NIK (KTP)</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                          <img src={tenant.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} alt="User" className="w-7 h-7 rounded-full object-cover" />
                          <span>{tenant.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{tenant.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{tenant.phone || "-"}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">{tenant.nik || "-"}</td>
                        <td className="py-3.5 px-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => openEditTenant(tenant)}
                            className="p-1 px-2.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center gap-1 font-semibold"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteTenant(tenant.id)}
                            className="p-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Hapus penyewa"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Subview: BOOKINGS MANUAL CONFIRMATION */}
          {erpTab === "bookings" && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
            >
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Konfirmasi Pengajuan Booking Kamar
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ulas verifikasi legalitas penyewa dan berikan persetujuan untuk meloloskan transaksi ke proses sewa aktif.
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="py-8 text-center text-slate-450">Belum ada pemesanan terekam.</div>
              ) : (
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase">
                        <th className="py-3 px-4 text-left">Sewa ID & Tanggal</th>
                        <th className="py-3 px-4 text-left">Nama Penyewa & NIK</th>
                        <th className="py-3 px-4 text-left">Kamar Unit</th>
                        <th className="py-3 px-4 text-left">Durasi sewa</th>
                        <th className="py-3 px-4 text-left">Total Biaya</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-right">Aksi Kontrol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono">
                            <p className="font-bold">{b.id}</p>
                            <p className="text-[10px] text-slate-400">{new Date(b.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="py-3.5 px-4 text-left">
                            <p className="font-bold text-slate-800 dark:text-slate-150">{b.name}</p>
                            <p className="text-[10px] text-slate-400">NIK: {b.nik}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-3 scaling-95 font-semibold">
                            {getRoomName(b.room_id)}
                          </td>
                          <td className="py-3.5 px-4">{b.duration_months} bln (Mulai {b.entry_date})</td>
                          <td className="py-3.5 px-4 font-bold text-slate-805 dark:text-slate-150">
                            Rp {b.total_price.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                              b.status === "confirmed" 
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {b.status === "confirmed" ? "Disetujui" : b.status === "rejected" ? "Ditolak" : "Menunggu Persetujuan"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {b.status === "pending" ? (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, "confirmed")}
                                  className="p-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold"
                                  title="Terima Booking"
                                >
                                  Disetujui
                                </button>
                                <button
                                  onClick={() => onUpdateBookingStatus(b.id, "rejected")}
                                  className="p-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                                  title="Tolak Booking"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-350 italic">Tindakan Selesai</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Subview: AUDIT PAYMENTS LEDGER */}
          {erpTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6"
            >
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Audit Verifikasi Pembayaran Sewa
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ulas bukti transfer bank yang diunggah oleh penghuni kos. Menyetujui kuitansi akan mengaktifkan sewa unit kamar.
                </p>
              </div>

              {payments.length === 0 ? (
                <div className="py-8 text-center text-slate-450">Belum ada riwayat setoran masuk.</div>
              ) : (
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase">
                        <th className="py-3 px-4">Kas ID & Tanggal</th>
                        <th className="py-3 px-4">Tenant Pembayar</th>
                        <th className="py-3 px-4">Metode Transfer</th>
                        <th className="py-3 px-4">Bukti Lampiran</th>
                        <th className="py-3 px-4">Bulan Tagihan</th>
                        <th className="py-3 px-4">Nominal Disetor</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-mono font-bold leading-tight">
                            {p.id}
                            <p className="text-[9px] text-slate-400 font-normal mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-150">
                            {getTenantName(p.user_id)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-550 font-semibold">{p.payment_method}</td>
                          <td className="py-3.5 px-4">
                            {p.proof_image ? (
                              <button 
                                onClick={() => setPreviewImage(p.proof_image || null)}
                                className="text-indigo-600 hover:underline flex items-center gap-0.5 font-semibold text-[11px] cursor-pointer bg-transparent border-none"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                                Lihat Bukti
                              </button>
                            ) : p.meetup_date ? (
                              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                                🤝 Janji: {p.meetup_date}
                              </span>
                            ) : (
                              <span className="text-slate-300">Tidak Ada</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium">{p.billing_month} {p.billing_year}</td>
                          <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-sky-400">
                            Rp {p.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                              p.status === "approved" 
                                ? "bg-emerald-100 text-emerald-850"
                                : p.status === "rejected"
                                ? "bg-rose-100 text-rose-850"
                                : "bg-amber-100 text-amber-850"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {p.status === "pending" ? (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => onUpdatePaymentStatus(p.id, "approved")}
                                  className="p-1 px-2.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold"
                                  title="Approve setoran"
                                >
                                  Lunas
                                </button>
                                <button
                                  onClick={() => onUpdatePaymentStatus(p.id, "rejected")}
                                  className="p-1 px-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-350 italic">Verified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Subview: EXPORTS & REPORTS GENERATION */}
          {erpTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="text-left pb-2 border-b border-slate-100">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  Audit Pelaporan Administrasi Kos
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ekspor otomatis basis data sewa kos ke dalam file CSV spreadsheet, siap diimpor ke file Excel ataupun dicetak sebagai PDF. Pencatatan terenkripsi penuh.
                </p>
              </div>

              {/* Reports Grid catalog cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {/* Rep 1: Penyewa */}
                <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-44">
                  <div className="space-y-1.5">
                    <span className="p-2 w-fit bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-xl block"><UsersIcon className="w-5 h-5" /></span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-550 mt-2">Laporan Buku Tamu & Registrasi Penyewa</h4>
                    <p className="text-[11px] text-slate-400">Total data: {tenants.length} Penyewa terdaftar KTP & nomor HP.</p>
                  </div>
                  <button
                    onClick={() => generateReportInfo("Penyewa")}
                    className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800 border hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-blue-500" />
                    Unduh CSV Spreadsheet
                  </button>
                </div>

                {/* Rep 2: Kamar */}
                <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-44">
                  <div className="space-y-1.5">
                    <span className="p-2 w-fit bg-purple-50 dark:bg-purple-900/10 text-purple-500 rounded-xl block"><BuildingIcon className="w-5 h-5" /></span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-550 mt-2">Laporan Utilitas & Ketersediaan Kamar</h4>
                    <p className="text-[11px] text-slate-400">Status kos: {availableRooms} Tersedia, {occupiedRooms} Terisi aktif.</p>
                  </div>
                  <button
                    onClick={() => generateReportInfo("Kamar")}
                    className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800 border hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-purple-500" />
                    Unduh CSV Spreadsheet
                  </button>
                </div>

                {/* Rep 3: Pembayaran */}
                <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-44">
                  <div className="space-y-1.5">
                    <span className="p-2 w-fit bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-xl block"><DollarSignIcon className="w-5 h-5" /></span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-550 mt-2">Laporan Rekonsiliasi Bank & Kuitansi</h4>
                    <p className="text-[11px] text-slate-400">Kas terkumpul: Rp {totalPendapatan.toLocaleString()} terverifikasi.</p>
                  </div>
                  <button
                    onClick={() => generateReportInfo("Pembayaran")}
                    className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800 border hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-emerald-500" />
                    Unduh CSV Spreadsheet
                  </button>
                </div>

                {/* Rep 4: Keuangan Pendapatan */}
                <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-44">
                  <div className="space-y-1.5">
                    <span className="p-2 w-fit bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl block"><LandmarkIcon className="w-5 h-5" /></span>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-slate-550 mt-2">Laporan Laba Rugi Kos Terbuku</h4>
                    <p className="text-[11px] text-slate-400">Periode: Pembukuan semesteran (Januari - Juni 2026).</p>
                  </div>
                  <button
                    onClick={() => generateReportInfo("LabaRugi")}
                    className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-800 border hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 text-rose-500" />
                    Unduh CSV Spreadsheet
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CRUD MODAL FOR ROOM */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-100 dark:border-slate-800 text-left space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  {roomEditMode === "add" ? "Tambah Unit Kamar Baru" : "Edit Spesifikasi Kamar"}
                </h3>
                <button onClick={() => setIsRoomModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRoomSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Kamar / No Unit</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                      placeholder="Contoh: Kamar Deluxe #401"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori Kamar Mandi</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={roomForm.type}
                      onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    >
                      <option value="Kamar Mandi Dalam">Kamar Mandi Dalam</option>
                      <option value="Kamar Mandi Luar">Kamar Mandi Luar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price Monthly */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tarif Bulanan (Rp)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={roomForm.price_monthly}
                      onChange={(e) => setRoomForm({ ...roomForm, price_monthly: Number(e.target.value) })}
                      required
                    />
                  </div>

                  {/* Price Yearly */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tarif Tahunan (Rp)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={roomForm.price_yearly}
                      onChange={(e) => setRoomForm({ ...roomForm, price_yearly: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                {/* File Upload & Preview Section */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Foto Unit Kamar
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Drag and Drop Container */}
                    <div
                      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      className={`relative border-2 border-dashed rounded-xl p-5 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] ${
                        dragActive
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-slate-300 hover:border-slate-400 bg-white"
                      }`}
                      onClick={() => document.getElementById("room-image-upload")?.click()}
                    >
                      <input
                        type="file"
                        id="room-image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFile(file);
                        }}
                      />
                      
                      <Upload className={`w-8 h-8 mb-2 transition-colors ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
                      
                      <p className="text-xs font-semibold text-slate-700">
                        Seret & taruh foto di sini, atau <span className="text-blue-600 hover:underline">Pilih File</span>
                      </p>
                      
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        Mendukung JPG, JPEG, PNG, WEBP (Maks 5 MB)
                      </p>
                    </div>

                    {/* Image Preview Container */}
                    <div className="border border-slate-200 bg-white rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[140px]">
                      {roomForm.imageUrl ? (
                        <div className="relative w-full h-[120px] rounded-lg overflow-hidden group">
                          <img
                            src={roomForm.imageUrl}
                            alt="Preview Kamar"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomForm(prev => ({ ...prev, imageUrl: "" }));
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 text-xs font-semibold transition"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400">
                          <p className="text-xs">Belum ada foto terpilih</p>
                          <p className="text-[10px] text-slate-350 mt-1">Gunakan dropzone sebelah kiri atau isi URL di bawah</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {uploadError && (
                    <div className="flex items-center gap-1.5 p-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Alternative URL Input */}
                  <div className="pt-1.5">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Atau masukkan URL gambar langsung (Opsional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none"
                      value={roomForm.imageUrl.startsWith("data:") ? "" : roomForm.imageUrl}
                      onChange={(e) => {
                        setUploadError("");
                        setRoomForm({ ...roomForm, imageUrl: e.target.value });
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status Ketersediaan</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                    >
                      <option value="tersedia">Tersedia</option>
                      <option value="dipesan">Dipesan</option>
                      <option value="terisi">Terisi</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Keterangan Deskripsi Lengkap</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none text-xs"
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  />
                </div>

                {/* Facilities checklist */}
                <div className="border-t pt-3">
                  <label className="block text-xs font-bold text-slate-500 mb-3">Fasilitas Checklist Unit</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { id: "wifi", label: "Internet Wi-Fi" },
                      { id: "bathroom_inside", label: "KM Mandi Dalam" },
                      { id: "electricity_token", label: "Mandiri Token" },
                      { id: "water_independent", label: "Pompa Air Sendiri" },
                      { id: "lrt_nearby", label: "Dekat Stasiun LRT" },
                      { id: "parking_area", label: "Lahan Parkir Luas" },
                      { id: "security", label: "Kecamatan 24 Jam" }
                    ].map((idx) => (
                      <label key={idx.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(roomForm as any)[idx.id]}
                          onChange={(e) => setRoomForm({ ...roomForm, [idx.id]: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>{idx.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-violet-600 hover:opacity-90 rounded-xl shadow"
                  >
                    {roomEditMode === "add" ? "Sembunyikan & Tambah" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRUD MODAL FOR TENANT */}
      <AnimatePresence>
        {isTenantModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 shadow-lg"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100">
                  {tenantEditMode === "add" ? "Input Penyewa KTP Baru" : "Edit Profil Penyewa"}
                </h3>
                <button onClick={() => setIsTenantModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTenantSubmit} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email Penyewa (Digunakan Login)</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor HP</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={tenantForm.phone}
                      onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NIK (KTP)</label>
                    <input
                      type="text"
                      maxLength={16}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={tenantForm.nik}
                      onChange={(e) => setTenantForm({ ...tenantForm, nik: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {tenantEditMode === "add" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Akun</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      value={tenantForm.password}
                      onChange={(e) => setTenantForm({ ...tenantForm, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTenantModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-violet-600 hover:opacity-90 rounded-xl shadow"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE BASE64 IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-100 dark:border-slate-800 text-left space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-100">
                  Pratinjau Bukti Transfer Pembayaran
                </h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 flex justify-center items-center overflow-auto max-h-[70vh]">
                <img
                  src={previewImage}
                  alt="Bukti Transfer Pembayaran"
                  className="max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:opacity-90 shadow cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
