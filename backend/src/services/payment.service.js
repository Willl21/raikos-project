import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";

export class PaymentService {
  static async getAllPayments() {
    const [rows] = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    return rows.map((p) => ({
      ...p,
      amount: Number(p.amount)
    }));
  }

  static async getPaymentById(id) {
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      ...p,
      amount: Number(p.amount)
    };
  }

  static async createPayment(pData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const paymentId = generateId("pmt");
      const amount = Number(pData.amount) || 0;
      const billingMonth = pData.billing_month || new Date().toLocaleString("id-ID", { month: "long" });
      const billingYear = pData.billing_year || new Date().getFullYear().toString();
      const createdAt = new Date();

      // 1. Insert payment
      await conn.query(
        `INSERT INTO payments (
          id, booking_id, user_id, amount, payment_method, proof_image, status, billing_month, billing_year, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [
          paymentId,
          pData.booking_id,
          pData.user_id,
          amount,
          pData.payment_method || "Transfer Bank",
          pData.proof_image || null,
          billingMonth,
          billingYear,
          createdAt
        ]
      );

      // 2. Create notification
      const notifId = generateId("notif");
      const message = `Bukti pembayaran Anda sebesar Rp ${amount.toLocaleString("id-ID")} telah kami terima dan sedang diproses verifikasi.`;
      
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, 'Bukti Pembayaran Diunggah 🏦', ?, 0, ?)`,
        [notifId, pData.user_id, message, createdAt]
      );

      await conn.commit();

      return {
        id: paymentId,
        booking_id: pData.booking_id,
        user_id: pData.user_id,
        amount,
        payment_method: pData.payment_method || "Transfer Bank",
        proof_image: pData.proof_image || null,
        status: "pending",
        billing_month: billingMonth,
        billing_year: billingYear,
        created_at: createdAt.toISOString()
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updatePayment(id, status) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Get payment
      const [payments] = await conn.query("SELECT * FROM payments WHERE id = ?", [id]);
      if (payments.length === 0) {
        throw new Error("Pembayaran tidak ditemukan");
      }
      const payment = payments[0];

      // 2. Update payment status
      await conn.query("UPDATE payments SET status = ? WHERE id = ?", [status, id]);

      // 3. If approved, confirm booking and set room to occupied (terisi)
      if (status === "approved") {
        const [bookings] = await conn.query("SELECT * FROM bookings WHERE id = ?", [payment.booking_id]);
        if (bookings.length > 0) {
          const booking = bookings[0];
          await conn.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [booking.id]);
          await conn.query("UPDATE rooms SET status = 'terisi' WHERE id = ?", [booking.room_id]);
        }
      }

      // 4. Create notification
      const notifId = generateId("notif");
      const title = status === "approved" ? "Pembayaran Disetujui ✅" : "Pembayaran Ditolak ⚠️";
      const message = status === "approved"
        ? `Pembayaran cicilan/sewa Anda untuk bulan ${payment.billing_month} ${payment.billing_year} sebesar Rp ${Number(payment.amount).toLocaleString("id-ID")} telah diverifikasi sukses!`
        : `Pembayaran Anda ditolak. Hubungi WA Admin Raikos untuk memperjelas alasan pembayaran bermasalah.`;

      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [notifId, payment.user_id, title, message, new Date()]
      );

      await conn.commit();

      return {
        ...payment,
        status,
        amount: Number(payment.amount)
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
