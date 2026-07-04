import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";

export class RentalService {
  /**
   * Automatically initializes columns/tables for the rental lifecycle system if they don't exist yet.
   */
  static async initializeDatabaseExtensions() {
    const conn = await pool.getConnection();
    try {
      // 1. Create table rental_extensions if not exists
      await conn.query(`
        CREATE TABLE IF NOT EXISTS rental_extensions (
          id VARCHAR(50) PRIMARY KEY,
          booking_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(50) NOT NULL,
          room_id VARCHAR(50) NOT NULL,
          duration_months INT NOT NULL,
          amount DECIMAL(12,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending_payment',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Check and add bookings.will_not_extend
      const [bookingCols] = await conn.query("SHOW COLUMNS FROM bookings LIKE 'will_not_extend'");
      if (bookingCols.length === 0) {
        await conn.query("ALTER TABLE bookings ADD COLUMN will_not_extend BOOLEAN DEFAULT FALSE;");
        console.log("[DbInit] Column 'will_not_extend' added to bookings table.");
      }

      // 3. Check and add payments.extension_id and its foreign key constraint
      const [paymentCols] = await conn.query("SHOW COLUMNS FROM payments LIKE 'extension_id'");
      if (paymentCols.length === 0) {
        await conn.query("ALTER TABLE payments ADD COLUMN extension_id VARCHAR(50) NULL;");
        await conn.query("ALTER TABLE payments ADD CONSTRAINT fk_payment_extension FOREIGN KEY (extension_id) REFERENCES rental_extensions(id) ON DELETE CASCADE;");
        console.log("[DbInit] Column 'extension_id' added to payments table.");
      }
    } catch (error) {
      console.error("[DbInit] Error initializing database extensions:", error);
    } finally {
      conn.release();
    }
  }

  static async getAllExtensions() {
    const [rows] = await pool.query("SELECT * FROM rental_extensions ORDER BY created_at DESC");
    return rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      duration_months: Number(r.duration_months)
    }));
  }

  static async getExtensionsByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM rental_extensions WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      duration_months: Number(r.duration_months)
    }));
  }

  static async createExtension({ booking_id, duration_months, user_id }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Find booking
      const [bookings] = await conn.query("SELECT room_id FROM bookings WHERE id = ?", [booking_id]);
      if (bookings.length === 0) {
        throw new Error("Booking tidak ditemukan");
      }
      const booking = bookings[0];

      // Find room price
      const [rooms] = await conn.query("SELECT price_monthly, name FROM rooms WHERE id = ?", [booking.room_id]);
      if (rooms.length === 0) {
        throw new Error("Kamar tidak ditemukan");
      }
      const room = rooms[0];

      const extId = generateId("ext");
      const amount = Number(room.price_monthly) * Number(duration_months);

      await conn.query(
        `INSERT INTO rental_extensions (id, booking_id, user_id, room_id, duration_months, amount, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending_payment')`,
        [extId, booking_id, user_id, booking.room_id, duration_months, amount]
      );

      // Create notification for tenant
      const notifId = generateId("notif");
      const message = `Pengajuan perpanjangan sewa kamar ${room.name} selama ${duration_months} bulan telah didaftarkan. Silakan lakukan pembayaran tagihan aktif Anda.`;
      await conn.query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
         VALUES (?, ?, 'Perpanjangan Sewa Diajukan 📝', ?, 0, ?)`,
        [notifId, user_id, message, new Date()]
      );

      await conn.commit();

      return {
        id: extId,
        booking_id,
        user_id,
        room_id: booking.room_id,
        duration_months,
        amount,
        status: "pending_payment"
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async setWillNotExtend(bookingId, willNotExtend) {
    await pool.query("UPDATE bookings SET will_not_extend = ? WHERE id = ?", [willNotExtend ? 1 : 0, bookingId]);
    return { success: true };
  }

  /**
   * Scans all bookings, notifies users when remaining rental time <= 7 days,
   * and terminates/expires rentals (updates room status and booking status) when remaining time is <= 0 days.
   */
  static async checkRentalLifecycles() {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Get all active bookings
      const [bookings] = await conn.query("SELECT * FROM bookings WHERE status = 'Completed'");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const b of bookings) {
        // Fetch room info
        const [rooms] = await conn.query("SELECT name FROM rooms WHERE id = ?", [b.room_id]);
        const roomName = rooms.length > 0 ? rooms[0].name : "Kamar";

        // Calculate end date
        const entryDate = new Date(b.entry_date);
        const endDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + Number(b.duration_months), entryDate.getDate());
        endDate.setHours(0, 0, 0, 0);

        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 1. Almost Expired Alert (<= 7 days and > 0 days remaining)
        if (diffDays <= 7 && diffDays > 0) {
          // Check if warning notification has already been sent for this booking in the past 7 days
          const [notifs] = await conn.query(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND title LIKE 'Masa Sewa Hampir Habis%' AND message LIKE ?",
            [b.user_id, `%${roomName}%`]
          );

          if (notifs[0].count === 0) {
            const notifId = generateId("notif");
            const message = `Masa sewa kamar Anda (${roomName}) akan segera berakhir dalam ${diffDays} hari. Silakan perpanjang sewa atau tentukan pilihan Anda di Dashboard.`;
            await conn.query(
              `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
               VALUES (?, ?, 'Masa Sewa Hampir Habis ⚠️', ?, 0, ?)`,
              [notifId, b.user_id, message, new Date()]
            );
            console.log(`[Lifecycle] Sent warning notification for booking ${b.id} to user ${b.user_id}`);
          }
        }

        // 2. Expired (<= 0 days remaining)
        if (diffDays <= 0) {
          // Check if there is any pending or active extension for this booking
          const [pendingExts] = await conn.query(
            "SELECT id FROM rental_extensions WHERE booking_id = ? AND status IN ('pending_payment', 'waiting_verification', 'approved')",
            [b.id]
          );
          const hasExtension = pendingExts.length > 0;

          // Expire if they chose will_not_extend OR if they did not extend at all and time is up
          if (b.will_not_extend || !hasExtension) {
            // Update room back to 'tersedia'
            await conn.query("UPDATE rooms SET status = 'tersedia' WHERE id = ?", [b.room_id]);
            
            // Mark booking status as 'Expired' (effectively making them not an active tenant)
            await conn.query("UPDATE bookings SET status = 'Expired' WHERE id = ?", [b.id]);

            // Add notification
            const notifId = generateId("notif");
            const message = `Masa sewa kamar Anda (${roomName}) telah berakhir. Terima kasih telah menempati hunian Raikos!`;
            await conn.query(
              `INSERT INTO notifications (id, user_id, title, message, is_read, created_at)
               VALUES (?, ?, 'Masa Sewa Berakhir 🏠', ?, 0, ?)`,
              [notifId, b.user_id, message, new Date()]
            );
            console.log(`[Lifecycle] Expired booking ${b.id} (room ${b.room_id}). Room is now 'tersedia'.`);
          }
        }
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("[Lifecycle] Error during lifecycle check:", error);
    } finally {
      conn.release();
    }
  }
}
