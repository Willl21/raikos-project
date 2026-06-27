import { NotificationService } from "../services/notification.service.js";

export class NotificationController {
  static async getNotificationsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await NotificationService.getNotificationsByUserId(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("[NotificationController.getNotificationsByUserId] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat notifikasi." });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await NotificationService.markAsRead(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("[NotificationController.markAsRead] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memperbarui status notifikasi." });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;
      await NotificationService.markAllAsRead(userId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("[NotificationController.markAllAsRead] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memperbarui status seluruh notifikasi." });
    }
  }
}
