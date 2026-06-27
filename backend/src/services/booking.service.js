import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";

export class BookingService {
  static async getAllBookings() {
    const [rows] = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
    return rows.map((b) => ({
      ...b,
      total_price: Number(b.total_price),
      duration_months: Number(b.duration_months)
    }));
  }

  static async getBookingById(id) {
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const b = rows[0];
    return {
      ...b,
      total_price: Number(b.total_price),
      duration_months: Number(b.duration_months)
    };
  }

  static async createBooking(bData) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Get room details and verify it exists
      const [rooms] = await conn.query("SELECT name FROM rooms WHERE id = ?", [bData.room_id]);
      if (rooms.length === 0) {
        throw new Error("Kamar tidak ditemukan");
      }
      const room = rooms[0];

      const bookingId = generateId("bkg");
      const userId = bData.user_id || `usr-guest-${Date.now()}`;
      const durationMonths = Number(bData.duration_months) || 1;
      const totalPrice = Number(bData.total_price) || 0;
      const createdAt = new Date();

      // 2. Insert booking record
      await conn.query(
        `INSERT INTO bookings (
          id, user_id, room_id, name, email, phone, nik,
          entry_date, duration_months, total_price, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          bookingId, userId, bData.room_id, bData.name, bData.email, bData.phone, bData.nik,
          bData.entry_date, durationMonths, totalPrice, createdAt
        ]
      );

      // 3. Update room status to "dipesan"
      await conn.query("UPDATE rooms SET status = 'dipesan' WHERE id = ?", [bData.room_id]);

      // 4. Create notification
      const notifId = generateId("notif");
      const message = `Pemesanan ${room.name} berhasil diajukan. Status Anda sekarang "Menunggu Konfirmasi". Silakan unggah bukti pembayaran di Dashboard Pemesanan untuk mempercepat konfirmasi.`;
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, 'Booking Berhasil Dibuat 📝', ?, 0, ?)`,
        [notifId, userId, message, createdAt]
      );

      await conn.commit();

      return {
        id: bookingId,
        user_id: userId,
        room_id: bData.room_id,
        name: bData.name,
        email: bData.email,
        phone: bData.phone,
        nik: bData.nik,
        entry_date: bData.entry_date,
        duration_months: durationMonths,
        total_price: totalPrice,
        status: "pending",
        created_at: createdAt.toISOString()
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateBooking(id, status) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Get booking
      const [bookings] = await conn.query("SELECT * FROM bookings WHERE id = ?", [id]);
      if (bookings.length === 0) {
        throw new Error("Booking tidak ditemukan");
      }
      const booking = bookings[0];

      // 2. Get room details
      const [rooms] = await conn.query("SELECT name FROM rooms WHERE id = ?", [booking.room_id]);
      const roomName = rooms.length > 0 ? rooms[0].name : "#";

      // 3. Update booking status
      await conn.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);

      // 4. Synchronize room status
      let newRoomStatus = "dipesan";
      if (status === "confirmed") {
        newRoomStatus = "terisi";

        // Auto-create approved payment if booking is confirmed
        const [existingPayments] = await conn.query("SELECT id FROM payments WHERE booking_id = ?", [id]);
        if (existingPayments.length === 0) {
          const paymentId = generateId("pmt");
          const now = new Date();
          const billingMonth = now.toLocaleString("id-ID", { month: "long" });
          const billingYear = now.getFullYear().toString();

          await conn.query(
            `INSERT INTO payments (
              id, booking_id, user_id, amount, payment_method, proof_image, status, billing_month, billing_year, created_at
            ) VALUES (?, ?, ?, ?, ?, NULL, 'approved', ?, ?, ?)`,
            [
              paymentId,
              id,
              booking.user_id,
              booking.total_price,
              "Instan Cash / Transfer (Verifikasi Admin)",
              billingMonth,
              billingYear,
              now
            ]
          );
        }
      } else if (status === "rejected") {
        newRoomStatus = "tersedia";
      }

      await conn.query("UPDATE rooms SET status = ? WHERE id = ?", [newRoomStatus, booking.room_id]);

      // 5. Create notification for user
      const notifId = generateId("notif");
      const title = status === "confirmed" ? "Booking Dikonfirmasi! 🎉" : "Booking Ditolak ❌";
      const message = status === "confirmed"
        ? `Selamat! Pemesanan Anda untuk kamar ${roomName} telah dikonfirmasi oleh Admin.`
        : `Maaf, pemesanan Anda untuk kamar ${roomName} belum disetujui. Silakan kontak admin untuk informasi lebih lanjut.`;
      
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [notifId, booking.user_id, title, message, new Date()]
      );

      await conn.commit();

      return {
        ...booking,
        status,
        total_price: Number(booking.total_price),
        duration_months: Number(booking.duration_months)
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
