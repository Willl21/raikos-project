import { pool } from "../config/database.js";
import { normalizeBoolean } from "../utils/helpers.js";

export class NotificationService {
  static async getNotificationsByUserId(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows.map((n) => ({
      ...n,
      is_read: normalizeBoolean(n.is_read)
    }));
  }

  static async markAsRead(id) {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  static async markAllAsRead(userId) {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  }
}
