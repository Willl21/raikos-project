import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Define initial seed database
const INITIAL_DATABASE = {
  users: [
    {
      id: "usr-1",
      name: "Budi Santoso",
      email: "penyewa@raikos.com",
      phone: "08123456789",
      nik: "3275010203040005",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      role: "tenant",
      password: "penyewa" // Stored in plain text for simple development access
    },
    {
      id: "usr-2",
      name: "Siti Rahma",
      email: "siti@raikos.com",
      phone: "08234567890",
      nik: "3275010203040006",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      role: "tenant",
      password: "penyewa"
    }
  ],
  admins: [
    {
      id: "adm-1",
      name: "Rian Hidayat",
      email: "admin@raikos.com",
      role: "admin",
      password: "admin"
    }
  ],
  rooms: [
    {
      id: "rm-1",
      name: "Kamar Suite Deluxe #101",
      type: "Kamar Mandi Dalam",
      price_monthly: 2200000,
      price_yearly: 24000000,
      description: "Kamar kos premium berukuran 4x4m dengan desain industrial modern. Sangat cocok bagi profesional maupun mahasiswa yang mendambakan privasi dan lingkungan belajar/kerja yang tenang.",
      status: "terisi",
      wifi: true,
      bathroom_inside: true,
      electricity_token: true,
      water_independent: true,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "rm-2",
      name: "Standard Cozy #102",
      type: "Kamar Mandi Dalam",
      price_monthly: 1800000,
      price_yearly: 19500000,
      description: "Kamar minimalis modern berukuran 3x4m, sudah termasuk kasur springbed berkualitas, lemari pakaian 2 pintu, dan meja kerja kayu yang stylish. Jaringan Wi-Fi super cepat.",
      status: "tersedia",
      wifi: true,
      bathroom_inside: true,
      electricity_token: true,
      water_independent: false,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "rm-3",
      name: "Mezzanine Loft Space #201",
      type: "Kamar Mandi Dalam",
      price_monthly: 2800000,
      price_yearly: 30000000,
      description: "Kamar loteng mewah ala apartemen studio berukuran 4x5m dengan tangga kayu menuju platform kasur mezzanine. Area bawah dapat difungsikan maksimal untuk ruang santai atau kantor pribadi.",
      status: "dipesan",
      wifi: true,
      bathroom_inside: true,
      electricity_token: true,
      water_independent: true,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "rm-4",
      name: "Compact Minimalist #202",
      type: "Kamar Mandi Luar",
      price_monthly: 1200000,
      price_yearly: 13000000,
      description: "Kamar kos ekonomis berukuran 3x3m yang bersih, rapi, dan fungsional. Dilengkapi jendela besar untuk pencahayaan alami yang sehat. Kamar mandi luar premium dibersihkan berkala oleh petugas kos.",
      status: "tersedia",
      wifi: true,
      bathroom_inside: false,
      electricity_token: true,
      water_independent: false,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
      ]
    },
    {
      id: "rm-5",
      name: "Executive Suite Balkon #301",
      type: "Kamar Mandi Dalam",
      price_monthly: 3200000,
      price_yearly: 35000000,
      description: "Kamar eksklusif paling luas di lantai teratas dengan balkon pribadi menghadap kota. Dilengkapi smart tv, mini kulkas, kamar mandi dalam dengan water heater, AC, dan sirkulasi udara luar biasa.",
      status: "tersedia",
      wifi: true,
      bathroom_inside: true,
      electricity_token: true,
      water_independent: true,
      lrt_nearby: true,
      parking_area: true,
      security: true,
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
      ]
    }
  ],
  bookings: [
    {
      id: "bkg-1",
      user_id: "usr-1",
      room_id: "rm-1",
      name: "Budi Santoso",
      email: "penyewa@raikos.com",
      phone: "08123456789",
      nik: "3275010203040005",
      entry_date: "2026-06-15",
      duration_months: 6,
      total_price: 13200000,
      status: "confirmed",
      created_at: "2026-06-01T10:15:30.000Z"
    },
    {
      id: "bkg-2",
      user_id: "usr-2",
      room_id: "rm-3",
      name: "Siti Rahma",
      email: "siti@raikos.com",
      phone: "08234567890",
      nik: "3275010203040006",
      entry_date: "2026-07-01",
      duration_months: 3,
      total_price: 8400000,
      status: "pending",
      created_at: "2026-06-05T14:22:15.000Z"
    }
  ],
  payments: [
    {
      id: "pmt-1",
      booking_id: "bkg-1",
      user_id: "usr-1",
      amount: 13200000,
      payment_method: "Transfer Bank BCA",
      proof_image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600",
      status: "approved",
      billing_month: "Juni",
      billing_year: "2026",
      created_at: "2026-06-01T11:00:00.000Z"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      user_id: "usr-1",
      title: "Booking Dikonfirmasi 🎉",
      message: "Selamat! Booking Anda untuk Kamar Suite Deluxe #101 telah dikonfirmasi oleh admin. Anda sudah dapat menempati kamar mulai tanggal 15 Juni 2026.",
      is_read: false,
      created_at: "2026-06-02T08:00:00.000Z"
    },
    {
      id: "notif-2",
      user_id: "usr-2",
      title: "Menunggu Verifikasi Pembayaran ⏳",
      message: "Booking Anda untuk Kamar Mezzanine Loft Space #201 sedang menunggu verifikasi pembayaran transfer Anda.",
      is_read: false,
      created_at: "2026-06-05T14:30:00.000Z"
    }
  ]
};

// JSON data-store Read-Write helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2));
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read database file, restoring defaults.", error);
    return INITIAL_DATABASE;
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to database file", error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Root endpoint to serve absolute DB data
  app.get("/api/db-status", (req, res) => {
    const db = readDB();
    res.json({
      status: "ready",
      roomsCount: db.rooms.length,
      usersCount: db.users.length,
      bookingsCount: db.bookings.length,
      paymentsCount: db.payments.length,
    });
  });

  // DB State reset (convenient for testing and clean slate)
  app.post("/api/db/reset", (req, res) => {
    writeDB(INITIAL_DATABASE);
    res.json({ message: "Database reset to seeded records successfully", success: true });
  });

  // Authentication routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const db = readDB();

    // Check if admin
    const admin = db.admins.find((a: any) => a.email === email && a.password === password);
    if (admin) {
      const { password: _, ...adminClean } = admin;
      return res.json({ success: true, user: adminClean, token: "admin-jwt" });
    }

    // Check if tenant/user
    const user = db.users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userClean } = user;
      return res.json({ success: true, user: userClean, token: "tenant-jwt" });
    }

    return res.status(401).json({ success: false, message: "Email atau password salah!" });
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, nik, password } = req.body;
    const db = readDB();

    // Check conflict
    const existUser = db.users.find((u: any) => u.email === email);
    if (existUser) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar!" });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      nik,
      avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`,
      role: "tenant" as const,
      password: password || "penyewa"
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...userClean } = newUser;
    res.json({ success: true, user: userClean, token: "tenant-jwt" });
  });

  app.post("/api/auth/google", (req, res) => {
    const { name, email, googleAvatar } = req.body;
    const db = readDB();

    let userIndex = db.users.findIndex((u: any) => u.email === email);
    let user;

    if (userIndex !== -1) {
      let existingUploaded = db.users[userIndex].uploadedAvatar || null;
      let existingGoogle = googleAvatar !== undefined ? googleAvatar : (db.users[userIndex].googleAvatar || null);

      db.users[userIndex] = {
        ...db.users[userIndex],
        isGoogleLogin: true,
        googleAvatar: existingGoogle,
        avatar: existingUploaded || existingGoogle || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
      };
      user = db.users[userIndex];
    } else {
      const defaultAv = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
      const resolvedAv = googleAvatar || defaultAv;
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name || "Pengguna Google",
        email: email,
        phone: "",
        nik: "",
        isGoogleLogin: true,
        googleAvatar: googleAvatar || null,
        uploadedAvatar: null,
        avatar: resolvedAv,
        role: "tenant" as const,
        password: `google-${Date.now()}`
      };
      db.users.push(newUser);
      user = newUser;
    }

    writeDB(db);
    const { password: _, ...userClean } = user;
    res.json({ success: true, user: userClean, token: "tenant-jwt" });
  });

  // --- Rooms Endpoints ---
  app.get("/api/rooms", (req, res) => {
    const db = readDB();
    res.json(db.rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const roomData = req.body;
    const db = readDB();

    const newRoom = {
      id: `rm-${Date.now()}`,
      name: roomData.name || "Kamar Kos Baru",
      type: roomData.type || "Kamar Mandi Dalam",
      price_monthly: Number(roomData.price_monthly) || 1500000,
      price_yearly: Number(roomData.price_yearly) || 16500000,
      description: roomData.description || "Hubungi admin untuk ketersediaan dan fasilitas tambahan.",
      status: (roomData.status || "tersedia") as any,
      wifi: roomData.wifi === true || roomData.wifi === "true",
      bathroom_inside: roomData.bathroom_inside === true || roomData.bathroom_inside === "true",
      electricity_token: roomData.electricity_token === true || roomData.electricity_token === "true",
      water_independent: roomData.water_independent === true || roomData.water_independent === "true",
      lrt_nearby: roomData.lrt_nearby === true || roomData.lrt_nearby === "true",
      parking_area: roomData.parking_area === true || roomData.parking_area === "true",
      security: roomData.security === true || roomData.security === "true",
      images: roomData.images && roomData.images.length > 0 ? roomData.images : [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
      ]
    };

    db.rooms.push(newRoom);
    writeDB(db);
    res.status(201).json({ success: true, room: newRoom });
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const roomData = req.body;
    const db = readDB();

    const index = db.rooms.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Kamar tidak ditemukan" });
    }

    db.rooms[index] = {
      ...db.rooms[index],
      name: roomData.name,
      type: roomData.type,
      price_monthly: Number(roomData.price_monthly),
      price_yearly: Number(roomData.price_yearly),
      description: roomData.description,
      status: roomData.status,
      wifi: roomData.wifi,
      bathroom_inside: roomData.bathroom_inside,
      electricity_token: roomData.electricity_token,
      water_independent: roomData.water_independent,
      lrt_nearby: roomData.lrt_nearby,
      parking_area: roomData.parking_area,
      security: roomData.security,
      images: roomData.images || db.rooms[index].images
    };

    writeDB(db);
    res.json({ success: true, room: db.rooms[index] });
  });

  app.delete("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();

    const initialLength = db.rooms.length;
    db.rooms = db.rooms.filter((r: any) => r.id !== id);

    if (db.rooms.length === initialLength) {
      return res.status(404).json({ success: false, message: "Kamar tidak ditemukan" });
    }

    writeDB(db);
    res.json({ success: true, message: "Kamar berhasil dihapus" });
  });

  // --- Tenants (Users) Endpoints ---
  app.get("/api/tenants", (req, res) => {
    const db = readDB();
    const cleanTenants = db.users.map((u: any) => {
      const { password: _, ...rest } = u;
      return rest;
    });
    res.json(cleanTenants);
  });

  app.post("/api/tenants", (req, res) => {
    const tData = req.body;
    const db = readDB();

    const newTenant = {
      id: `usr-${Date.now()}`,
      name: tData.name,
      email: tData.email,
      phone: tData.phone || "",
      nik: tData.nik || "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      role: "tenant" as const,
      password: tData.password || "penyewa"
    };

    db.users.push(newTenant);
    writeDB(db);

    const { password: _, ...clean } = newTenant;
    res.json({ success: true, tenant: clean });
  });

  app.put("/api/tenants/:id", (req, res) => {
    const { id } = req.params;
    const tData = req.body;
    const db = readDB();

    const index = db.users.findIndex((u: any) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Penyewa tidak ditemukan" });
    }

    const currentGoogleAvatar = tData.googleAvatar !== undefined ? tData.googleAvatar : db.users[index].googleAvatar;
    let currentUploadedAvatar = db.users[index].uploadedAvatar;

    if (tData.hasOwnProperty("uploadedAvatar")) {
      currentUploadedAvatar = tData.uploadedAvatar; // can be null or dynamic string
    }

    const defaultAv = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    const resolvedAvatar = currentUploadedAvatar || currentGoogleAvatar || defaultAv;

    db.users[index] = {
      ...db.users[index],
      name: tData.name !== undefined ? tData.name : db.users[index].name,
      email: tData.email !== undefined ? tData.email : db.users[index].email,
      phone: tData.phone !== undefined ? tData.phone : db.users[index].phone,
      nik: tData.nik !== undefined ? tData.nik : db.users[index].nik,
      uploadedAvatar: currentUploadedAvatar,
      googleAvatar: currentGoogleAvatar,
      isGoogleLogin: tData.isGoogleLogin !== undefined ? tData.isGoogleLogin : db.users[index].isGoogleLogin,
      avatar: resolvedAvatar
    };

    writeDB(db);
    const { password: _, ...clean } = db.users[index];
    res.json({ success: true, tenant: clean });
  });

  app.delete("/api/tenants/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.users = db.users.filter((u: any) => u.id !== id);
    writeDB(db);
    res.json({ success: true });
  });


  // --- Bookings Endpoints ---
  app.get("/api/bookings", (req, res) => {
    const db = readDB();
    res.json(db.bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const bData = req.body;
    const db = readDB();

    // Check if room exists and is available
    const room = db.rooms.find((r: any) => r.id === bData.room_id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Kamar tidak ditemukan" });
    }

    const newBooking = {
      id: `bkg-${Date.now()}`,
      user_id: bData.user_id || `usr-guest-${Date.now()}`,
      room_id: bData.room_id,
      name: bData.name,
      email: bData.email,
      phone: bData.phone,
      nik: bData.nik,
      entry_date: bData.entry_date,
      duration_months: Number(bData.duration_months) || 1,
      total_price: Number(bData.total_price),
      status: "pending" as const,
      created_at: new Date().toISOString()
    };

    // Before admin approves booking, the room status remains "tersedia" (available)
    room.status = "tersedia";

    db.bookings.push(newBooking);

    // Create a transaction notification for the booking
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: newBooking.user_id,
      title: "Booking Berhasil Dibuat 📝",
      message: `Pemesanan ${room.name} berhasil diajukan. Status Anda sekarang "Menunggu Konfirmasi". Silakan unggah bukti pembayaran di Dashboard Pemesanan untuk mempercepat konfirmasi.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, booking: newBooking });
  });

  app.put("/api/bookings/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // pending, confirmed, rejected
    const db = readDB();

    const booking = db.bookings.find((b: any) => b.id === id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
    }

    booking.status = status;

    // Synchronize room status based on booking status
    const room = db.rooms.find((r: any) => r.id === booking.room_id);
    if (room) {
      if (status === "confirmed") {
        room.status = "BOOKED";
      } else if (status === "rejected") {
        room.status = "tersedia";
      } else {
        room.status = "tersedia";
      }
    }

    // Push notification for user
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: booking.user_id,
      title: status === "confirmed" ? "Booking Dikonfirmasi! 🎉" : "Booking Ditolak ❌",
      message: status === "confirmed" 
        ? `Selamat! Pemesanan Anda untuk kamar ${room?.name || '#'} telah dikonfirmasi oleh Admin. Silakan lakukan pembayaran di Dashboard Penyewa Anda.` 
        : `Maaf, pemesanan Anda untuk kamar ${room?.name || '#'} belum disetujui. Silakan kontak admin untuk informasi lebih lanjut.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, booking });
  });

  // --- Payments Endpoints ---
  app.get("/api/payments", (req, res) => {
    const db = readDB();
    res.json(db.payments);
  });

  app.post("/api/payments", (req, res) => {
    const pData = req.body;
    const db = readDB();

    const newPayment = {
      id: `pmt-${Date.now()}`,
      booking_id: pData.booking_id,
      user_id: pData.user_id,
      amount: Number(pData.amount),
      payment_method: pData.payment_method || "Transfer Bank",
      proof_image: pData.proof_image || null,
      meetup_date: pData.meetup_date || null,
      status: "pending" as const,
      billing_month: pData.billing_month || new Date().toLocaleString("id-ID", { month: "long" }),
      billing_year: pData.billing_year || new Date().getFullYear().toString(),
      created_at: new Date().toISOString()
    };

    db.payments.push(newPayment);

    // notify Admin/User
    const isCash = !!pData.meetup_date;
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: pData.user_id,
      title: isCash ? "Janji Temu Cash Diajukan 🤝" : "Bukti Pembayaran Diunggah 🏦",
      message: isCash 
        ? `Permintaan janji temu pembayaran cash Anda pada tanggal ${pData.meetup_date} telah diajukan dan menunggu verifikasi Admin.`
        : `Bukti pembayaran Anda sebesar Rp ${newPayment.amount.toLocaleString()} telah kami terima dan sedang diproses verifikasi.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, payment: newPayment });
  });

  app.put("/api/payments/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = readDB();

    const payment = db.payments.find((p: any) => p.id === id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan" });
    }

    payment.status = status;

    // If payment approved, also confirm booking and fill room
    if (status === "approved") {
      const booking = db.bookings.find((b: any) => b.id === payment.booking_id);
      if (booking) {
        booking.status = "confirmed";
        const room = db.rooms.find((r: any) => r.id === booking.room_id);
        if (room) {
          room.status = "terisi";
        }
      }
    }

    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: payment.user_id,
      title: status === "approved" ? "Pembayaran Disetujui ✅" : "Pembayaran Ditolak ⚠️",
      message: status === "approved" 
        ? `Pembayaran cicilan/sewa Anda untuk bulan ${payment.billing_month} ${payment.billing_year} sebesar Rp ${payment.amount.toLocaleString()} telah diverifikasi sukses!`
        : `Pembayaran Anda ditolak. Hubungi WA Admin Raikos untuk memperjelas alasan pembayaran bermasalah.`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    writeDB(db);
    res.json({ success: true, payment });
  });

  // --- Notifications Endpoints ---
  app.get("/api/notifications/:userId", (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    const userNotifs = db.notifications.filter((n: any) => n.user_id === userId);
    res.json(userNotifs);
  });

  app.put("/api/notifications/read/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const notif = db.notifications.find((n: any) => n.id === id);
    if (notif) {
      notif.is_read = true;
      writeDB(db);
    }
    res.json({ success: true });
  });

  app.put("/api/notifications/read-all/:userId", (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    db.notifications.forEach((n: any) => {
      if (n.user_id === userId) n.is_read = true;
    });
    writeDB(db);
    res.json({ success: true });
  });

  // --- MySQL Schema & ERD metadata ---
  app.get("/api/erd", (req, res) => {
    const erdText = `
-- -----------------------------------------------------
-- DATABASE SCHEMA: RAIKOS (MySQL RELATIONAL TABLES)
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nik VARCHAR(20) NOT NULL,
  avatar VARCHAR(255),
  role VARCHAR(15) DEFAULT 'tenant'
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(15) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'tersedia', -- 'tersedia', 'dipesan', 'terisi'
  wifi BOOLEAN DEFAULT TRUE,
  bathroom_inside BOOLEAN DEFAULT TRUE,
  electricity_token BOOLEAN DEFAULT TRUE,
  water_independent BOOLEAN DEFAULT FALSE,
  lrt_nearby BOOLEAN DEFAULT TRUE,
  parking_area BOOLEAN DEFAULT TRUE,
  security BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS room_images (
  id VARCHAR(50) PRIMARY KEY,
  room_id VARCHAR(50) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  nik VARCHAR(20) NOT NULL,
  entry_date DATE NOT NULL,
  duration_months INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  proof_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  billing_month VARCHAR(20) NOT NULL,
  billing_year VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'penyewa', 'kamar', 'pembayaran', 'pendapatan'
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL, -- JSON formatted data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `;

    res.json({
      success: true,
      sql: erdText,
      relationships: [
        { from: "room_images", to: "rooms", keys: "room_id -> id", type: "Many-to-One" },
        { from: "bookings", to: "users", keys: "user_id -> id", type: "Many-to-One" },
        { from: "bookings", to: "rooms", keys: "room_id -> id", type: "Many-to-One" },
        { from: "payments", to: "bookings", keys: "booking_id -> id", type: "Many-to-One" },
        { from: "payments", to: "users", keys: "user_id -> id", type: "Many-to-One" },
        { from: "notifications", to: "users", keys: "user_id -> id", type: "Many-to-One" }
      ]
    });
  });

  // Vite development middleware OR static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Raikos Server] Running securely on port ${PORT}`);
    // Boot the DB immediately
    readDB();
  });
}

startServer();
