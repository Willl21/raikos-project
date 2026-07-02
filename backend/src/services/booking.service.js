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

      // 1. Get room details and verify it exists (using FOR UPDATE to prevent race conditions)
      const [rooms] = await conn.query("SELECT name, status FROM rooms WHERE id = ? FOR UPDATE", [bData.room_id]);
      if (rooms.length === 0) {
        throw new Error("Kamar tidak ditemukan");
      }
      const room = rooms[0];

      // Prevent booking if the room is not available
      if (room.status !== "Tersedia" && room.status !== "tersedia") {
        throw new Error("Kamar tidak tersedia untuk dipesan");
      }

      const bookingId = generateId("bkg");
      const userId = bData.user_id || `usr-guest-${Date.now()}`;
      const durationMonths = Number(bData.duration_months) || 1;
      const totalPrice = Number(bData.total_price) || 0;
      const createdAt = new Date();

      // 2. Insert booking record with 'Pending Approval' status
      await conn.query(
        `INSERT INTO bookings (
          id, user_id, room_id, name, email, phone, nik,
          entry_date, duration_months, total_price, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Approval', ?)`,
        [
          bookingId, userId, bData.room_id, bData.name, bData.email, bData.phone, bData.nik,
          bData.entry_date, durationMonths, totalPrice, createdAt
        ]
      );

      // 3. DO NOT change room status (remains Tersedia) for Step 1

      // 4. Create notification
      const notifId = generateId("notif");
      const message = `Pemesanan ${room.name} berhasil diajukan. Status Booking Anda sekarang "Pending Approval" (Menunggu Persetujuan Admin).`;
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, 'Booking Berhasil Diajukan 📝', ?, 0, ?)`,
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
        status: "Pending Approval",
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

      // Normalize status casing and map
      let dbStatus = status;
      if (status === "Approved") {
        dbStatus = "Approved";
      } else if (status === "rejected" || status === "Rejected") {
        dbStatus = "Rejected";
      } else if (status === "Completed") {
        dbStatus = "Completed";
      }

      // 3. Update booking status
      await conn.query("UPDATE bookings SET status = ? WHERE id = ?", [dbStatus, id]);

      // 4. Synchronize room status
      let newRoomStatus = "Tersedia";
      if (dbStatus === "Approved") {
        newRoomStatus = "BOOKED";
      } else if (dbStatus === "Completed") {
        newRoomStatus = "Terisi";
      } else if (dbStatus === "Rejected") {
        newRoomStatus = "Tersedia";
      }

      await conn.query("UPDATE rooms SET status = ? WHERE id = ?", [newRoomStatus, booking.room_id]);

      // 5. Create notification for user
      const notifId = generateId("notif");
      let title = "Update Status Booking";
      let message = "";

      if (dbStatus === "Approved") {
        title = "Booking Disetujui! 🎉";
        message = `Selamat! Pemesanan Anda untuk kamar ${roomName} telah disetujui oleh Admin. Silakan pilih metode pembayaran (Transfer / Cash) di Dashboard Anda untuk menyelesaikan pemesanan.`;
      } else if (dbStatus === "Rejected") {
        title = "Booking Ditolak ❌";
        message = `Maaf, pemesanan Anda untuk kamar ${roomName} ditolak oleh Admin. Kamar tersebut kembali tersedia.`;
      } else if (dbStatus === "Completed") {
        title = "Booking Selesai & Kamar Aktif! 🏠";
        message = `Pembayaran sewa kamar ${roomName} telah diverifikasi lunas. Selamat menikmati fasilitas hunian Anda!`;
      }
      
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [notifId, booking.user_id, title, message, new Date()]
      );

      await conn.commit();

      return {
        ...booking,
        status: dbStatus,
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
