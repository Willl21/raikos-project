import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";

export class ReportService {
  static async getAllReports() {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
    return rows.map((r) => ({
      ...r,
      data: JSON.parse(r.content) // Map database 'content' to 'data' for the frontend
    }));
  }

  static async generateReport(type, title) {
    let reportData = [];
    const id = generateId("rpt");

    if (type === "penyewa") {
      // Compile tenants report
      const [tenants] = await pool.query("SELECT id, name, email, phone, nik FROM users");
      const [bookings] = await pool.query("SELECT id, user_id, room_id, status, entry_date FROM bookings");
      const [rooms] = await pool.query("SELECT id, name FROM rooms");

      reportData = tenants.map((t) => {
        const tenantBooking = bookings.find((b) => b.user_id === t.id && b.status === "confirmed");
        const room = tenantBooking ? rooms.find((r) => r.id === tenantBooking.room_id) : null;
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          nik: t.nik,
          roomName: room ? room.name : "Belum Menempati",
          entryDate: tenantBooking ? tenantBooking.entry_date : "-"
        };
      });
    } else if (type === "kamar") {
      // Compile rooms report
      const [rooms] = await pool.query("SELECT id, name, type, price_monthly, status FROM rooms");
      reportData = rooms.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        priceMonthly: Number(r.price_monthly),
        status: r.status
      }));
    } else if (type === "pembayaran") {
      // Compile payments report
      const [payments] = await pool.query(
        `SELECT p.id, p.amount, p.payment_method, p.status, p.billing_month, p.billing_year, u.name as tenant_name
         FROM payments p
         LEFT JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`
      );
      reportData = payments.map((p) => ({
        id: p.id,
        tenantName: p.tenant_name || "Guest / Unknown",
        amount: Number(p.amount),
        method: p.payment_method,
        status: p.status,
        period: `${p.billing_month} ${p.billing_year}`
      }));
    } else if (type === "pendapatan") {
      // Compile revenue aggregation report
      const [payments] = await pool.query(
        `SELECT billing_month, billing_year, SUM(amount) as total_revenue, COUNT(id) as transaction_count
         FROM payments
         WHERE status = 'approved'
         GROUP BY billing_year, billing_month`
      );
      reportData = payments.map((p) => ({
        period: `${p.billing_month} ${p.billing_year}`,
        totalRevenue: Number(p.total_revenue),
        transactionCount: Number(p.transaction_count)
      }));
    } else {
      throw new Error("Tipe laporan tidak valid!");
    }

    const content = JSON.stringify(reportData);
    const createdAt = new Date();

    await pool.query(
      "INSERT INTO reports (id, type, title, content, created_at) VALUES (?, ?, ?, ?, ?)",
      [id, type, title || `Laporan ${type.toUpperCase()}`, content, createdAt]
    );

    return {
      id,
      type,
      title: title || `Laporan ${type.toUpperCase()}`,
      data: reportData,
      created_at: createdAt.toISOString()
    };
  }

  // ── NEW: Real-time statistics for the reports dashboard ──
  static async getReportStats() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // ── Penyewa (Tenant) Stats ──
    // Active tenants: users who have at least one booking with status Approved/Completed and room is Terisi/terisi
    const [activeTenants] = await pool.query(
      `SELECT COUNT(DISTINCT b.user_id) as count FROM bookings b
       INNER JOIN rooms r ON b.room_id = r.id
       WHERE b.status IN ('Approved', 'Completed')
       AND (r.status = 'Terisi' OR r.status = 'terisi')`
    );
    const penyewaAktif = Number(activeTenants[0]?.count || 0);

    // Completed tenants: users whose bookings are Expired or Completed and room is no longer occupied by them
    const [completedTenants] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM bookings
       WHERE status IN ('Expired', 'Completed')
       AND user_id NOT IN (
         SELECT DISTINCT b2.user_id FROM bookings b2
         INNER JOIN rooms r2 ON b2.room_id = r2.id
         WHERE b2.status IN ('Approved', 'Completed')
         AND (r2.status = 'Terisi' OR r2.status = 'terisi')
       )`
    );
    const penyewaSelesai = Number(completedTenants[0]?.count || 0);

    // New tenants this month: users registered via bookings created this month
    const [newTenants] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM bookings
       WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?`,
      [currentMonth, currentYear]
    );
    const penyewaBaruBulanIni = Number(newTenants[0]?.count || 0);

    // ── Kamar (Room) Stats ──
    const [totalKamarResult] = await pool.query("SELECT COUNT(*) as count FROM rooms");
    const totalKamar = Number(totalKamarResult[0]?.count || 0);

    const [tersediaResult] = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status IN ('Tersedia', 'tersedia')"
    );
    const kamarTersedia = Number(tersediaResult[0]?.count || 0);

    const [terisiResult] = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status IN ('Terisi', 'terisi', 'BOOKED', 'dipesan')"
    );
    const kamarTerisi = Number(terisiResult[0]?.count || 0);

    const [maintenanceResult] = await pool.query(
      "SELECT COUNT(*) as count FROM rooms WHERE status IN ('Maintenance', 'maintenance')"
    );
    const kamarMaintenance = Number(maintenanceResult[0]?.count || 0);

    // ── Pembayaran (Payment) Stats ──
    const [paidResult] = await pool.query(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'Paid'"
    );
    const pembayaranBerhasil = Number(paidResult[0]?.count || 0);

    const [pendingPayResult] = await pool.query(
      "SELECT COUNT(*) as count FROM payments WHERE status IN ('pending', 'Waiting Verification')"
    );
    const pembayaranPending = Number(pendingPayResult[0]?.count || 0);

    const [revenueResult] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Paid'"
    );
    const totalPendapatan = Number(revenueResult[0]?.total || 0);

    // ── Pemesanan (Booking) Stats ──
    const [totalBookingResult] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const totalBooking = Number(totalBookingResult[0]?.count || 0);

    const [bookingSelesaiResult] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status IN ('Approved', 'Completed')"
    );
    const bookingSelesai = Number(bookingSelesaiResult[0]?.count || 0);

    const [bookingBatalResult] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status IN ('Rejected', 'rejected', 'Expired')"
    );
    const bookingDibatalkan = Number(bookingBatalResult[0]?.count || 0);

    const [bookingWaitingResult] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'Pending Approval')"
    );
    const bookingMenunggu = Number(bookingWaitingResult[0]?.count || 0);

    return {
      penyewa: {
        aktif: penyewaAktif,
        selesai: penyewaSelesai,
        baruBulanIni: penyewaBaruBulanIni
      },
      kamar: {
        total: totalKamar,
        tersedia: kamarTersedia,
        terisi: kamarTerisi,
        maintenance: kamarMaintenance
      },
      pembayaran: {
        berhasil: pembayaranBerhasil,
        pending: pembayaranPending,
        totalPendapatan: totalPendapatan
      },
      pemesanan: {
        total: totalBooking,
        selesai: bookingSelesai,
        dibatalkan: bookingDibatalkan,
        menunggu: bookingMenunggu
      }
    };
  }

  // ── NEW: Get CSV data for report download ──
  static async getReportCSVData(type) {
    if (type === "penyewa") {
      const [rows] = await pool.query(
        `SELECT
           u.name AS nama,
           u.phone AS nomor_hp,
           u.email,
           u.nik AS nomor_ktp,
           COALESCE(DATE_FORMAT(b.entry_date, '%Y-%m-%d'), '-') AS tanggal_masuk,
           CASE
             WHEN b.id IS NOT NULL AND b.status IN ('Approved', 'Completed')
                  AND (r.status = 'Terisi' OR r.status = 'terisi') THEN 'Aktif'
             WHEN b.id IS NOT NULL AND b.status IN ('Expired', 'Completed')
                  AND (r.status != 'Terisi' AND r.status != 'terisi') THEN 'Selesai'
             ELSE 'Tidak Aktif'
           END AS status
         FROM users u
         LEFT JOIN (
           SELECT b1.* FROM bookings b1
           INNER JOIN (
             SELECT user_id, MAX(created_at) as max_created FROM bookings GROUP BY user_id
           ) b2 ON b1.user_id = b2.user_id AND b1.created_at = b2.max_created
         ) b ON u.id = b.user_id
         LEFT JOIN rooms r ON b.room_id = r.id
         ORDER BY u.name ASC`
      );
      return {
        headers: ["Nama", "Nomor HP", "Email", "Nomor KTP", "Tanggal Masuk", "Status"],
        rows: rows.map((r) => [
          r.nama, 
          r.nomor_hp ? `'${r.nomor_hp}` : "-", 
          r.email, 
          r.nomor_ktp ? `'${r.nomor_ktp}` : "-", 
          r.tanggal_masuk, 
          r.status
        ])
      };
    }

    if (type === "kamar") {
      const [rows] = await pool.query(
        `SELECT
           r.name AS nomor_kamar,
           r.price_monthly AS harga,
           r.status,
           COALESCE(u.name, '-') AS penyewa_saat_ini
         FROM rooms r
         LEFT JOIN bookings b ON r.id = b.room_id
           AND b.status IN ('Approved', 'Completed')
           AND (r.status = 'Terisi' OR r.status = 'terisi')
         LEFT JOIN users u ON b.user_id = u.id
         ORDER BY r.name ASC`
      );
      return {
        headers: ["Nomor Kamar", "Harga", "Status", "Penyewa Saat Ini"],
        rows: rows.map((r) => [r.nomor_kamar, Number(r.harga), r.status, r.penyewa_saat_ini])
      };
    }

    if (type === "pembayaran") {
      const [rows] = await pool.query(
        `SELECT
           u.name AS nama_penyewa,
           rm.name AS nomor_kamar,
           p.amount AS nominal,
           p.payment_method AS metode_pembayaran,
           p.status AS status_pembayaran,
           DATE_FORMAT(p.created_at, '%Y-%m-%d') AS tanggal_pembayaran
         FROM payments p
         LEFT JOIN users u ON p.user_id = u.id
         LEFT JOIN bookings b ON p.booking_id = b.id
         LEFT JOIN rooms rm ON b.room_id = rm.id
         ORDER BY p.created_at DESC`
      );
      return {
        headers: ["Nama Penyewa", "Nomor Kamar", "Nominal", "Metode Pembayaran", "Status Pembayaran", "Tanggal Pembayaran"],
        rows: rows.map((r) => [r.nama_penyewa || "-", r.nomor_kamar || "-", Number(r.nominal), r.metode_pembayaran, r.status_pembayaran, r.tanggal_pembayaran])
      };
    }

    if (type === "pemesanan") {
      const [rows] = await pool.query(
        `SELECT
           b.name AS nama_penyewa,
           r.name AS nomor_kamar,
           DATE_FORMAT(b.created_at, '%Y-%m-%d') AS tanggal_booking,
           CONCAT(b.duration_months, ' Bulan') AS durasi_sewa,
           b.status AS status_booking
         FROM bookings b
         LEFT JOIN rooms r ON b.room_id = r.id
         ORDER BY b.created_at DESC`
      );
      return {
        headers: ["Nama Penyewa", "Nomor Kamar", "Tanggal Booking", "Durasi Sewa", "Status Booking"],
        rows: rows.map((r) => [r.nama_penyewa, r.nomor_kamar || "-", r.tanggal_booking, r.durasi_sewa, r.status_booking])
      };
    }

    throw new Error("Tipe laporan tidak valid!");
  }
}
