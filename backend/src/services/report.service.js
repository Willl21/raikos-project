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
}
