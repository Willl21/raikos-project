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

      // 1. Get current booking details and validate existence
      const [bookings] = await conn.query("SELECT entry_date, user_id FROM bookings WHERE id = ?", [pData.booking_id]);
      if (bookings.length === 0) {
        throw new Error("Booking tidak ditemukan");
      }
      const booking = bookings[0];

      const paymentId = generateId("pmt");
      const amount = Number(pData.amount) || 0;
      const billingMonth = pData.billing_month || new Date().toLocaleString("id-ID", { month: "long" });
      const billingYear = pData.billing_year || new Date().getFullYear().toString();
      const createdAt = new Date();

      const isCash = pData.payment_method === "Cash Langsung" || pData.payment_method === "Cash";

      // 2. Validate meetup date if cash payment (max H-3 from entry_date)
      if (isCash) {
        if (!pData.meeting_date) {
          throw new Error("Tanggal janji bertemu wajib diisi untuk pembayaran Cash.");
        }
        const entryDate = new Date(booking.entry_date);
        const maxMeetupDate = new Date(entryDate);
        maxMeetupDate.setDate(maxMeetupDate.getDate() - 3);

        const meetupDateObj = new Date(pData.meeting_date);
        if (meetupDateObj > maxMeetupDate) {
          throw new Error("Tanggal janji temu maksimal H-3 dari tanggal check-in.");
        }
      }

      // 3. Insert payment with status 'Waiting Verification'
      await conn.query(
        `INSERT INTO payments (
          id, booking_id, user_id, amount, payment_method, proof_image, meeting_date, status, billing_month, billing_year, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Waiting Verification', ?, ?, ?)`,
        [
          paymentId,
          pData.booking_id,
          pData.user_id,
          amount,
          pData.payment_method || "Transfer Bank BCA",
          isCash ? null : (pData.proof_image || null),
          isCash ? pData.meeting_date : null,
          billingMonth,
          billingYear,
          createdAt
        ]
      );

      // 4. Create notification
      const notifId = generateId("notif");
      const message = isCash
        ? `Janji temu pembayaran Cash sebesar Rp ${amount.toLocaleString("id-ID")} pada tanggal ${pData.meeting_date} berhasil diajukan dan sedang menunggu verifikasi.`
        : `Bukti pembayaran Transfer sebesar Rp ${amount.toLocaleString("id-ID")} telah kami terima dan sedang diproses verifikasi.`;

      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, 'Verifikasi Pembayaran Diajukan ⏳', ?, 0, ?)`,
        [notifId, pData.user_id, message, createdAt]
      );

      await conn.commit();

      return {
        id: paymentId,
        booking_id: pData.booking_id,
        user_id: pData.user_id,
        amount,
        payment_method: pData.payment_method,
        proof_image: isCash ? null : (pData.proof_image || null),
        meeting_date: isCash ? pData.meeting_date : null,
        status: "Waiting Verification",
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

      // Normalize status mapping
      let dbStatus = status;
      if (status === "approved" || status === "Paid") {
        dbStatus = "Paid";
      } else if (status === "rejected" || status === "Rejected") {
        dbStatus = "Rejected";
      }

      // 2. Update payment status
      await conn.query("UPDATE payments SET status = ? WHERE id = ?", [dbStatus, id]);

      // 3. Update related booking and room status
      const [bookings] = await conn.query("SELECT id, room_id, name FROM bookings WHERE id = ?", [payment.booking_id]);
      let roomName = "#";
      if (bookings.length > 0) {
        const booking = bookings[0];

        // Fetch room name
        const [rooms] = await conn.query("SELECT name FROM rooms WHERE id = ?", [booking.room_id]);
        if (rooms.length > 0) {
          roomName = rooms[0].name;
        }

        const newBookingStatus = (dbStatus === "Paid") ? "Completed" : "Rejected";
        const newRoomStatus = (dbStatus === "Paid") ? "Terisi" : "Tersedia";

        await conn.query("UPDATE bookings SET status = ? WHERE id = ?", [newBookingStatus, booking.id]);
        await conn.query("UPDATE rooms SET status = ? WHERE id = ?", [newRoomStatus, booking.room_id]);
      }

      // 4. Create notification for tenant
      const notifId = generateId("notif");
      const title = dbStatus === "Paid" ? "Pembayaran Disetujui ✅" : "Pembayaran Ditolak ⚠️";
      const message = dbStatus === "Paid"
        ? `Pembayaran Anda untuk sewa kamar ${roomName} sebesar Rp ${Number(payment.amount).toLocaleString("id-ID")} telah berhasil diverifikasi. Selamat menikmati hunian!`
        : `Pembayaran Anda ditolak oleh Admin. Status booking kamar ${roomName} dibatalkan dan dikembalikan menjadi Tersedia.`;

      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [notifId, payment.user_id, title, message, new Date()]
      );

      await conn.commit();

      return {
        ...payment,
        status: dbStatus,
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
