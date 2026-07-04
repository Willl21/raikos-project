import { RentalService } from "../services/rental.service.js";

export class RentalController {
  static async getAllExtensions(req, res) {
    try {
      const extensions = await RentalService.getAllExtensions();
      return res.status(200).json(extensions);
    } catch (error) {
      console.error("[RentalController.getAllExtensions] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat daftar perpanjangan." });
    }
  }

  static async getExtensionsByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID wajib disertakan." });
      }
      const extensions = await RentalService.getExtensionsByUserId(userId);
      return res.status(200).json(extensions);
    } catch (error) {
      console.error("[RentalController.getExtensionsByUserId] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat daftar perpanjangan user." });
    }
  }

  static async createExtension(req, res) {
    try {
      const { booking_id, duration_months, user_id } = req.body;
      if (!booking_id || !duration_months || !user_id) {
        return res.status(400).json({ success: false, message: "Field booking_id, duration_months, dan user_id wajib diisi." });
      }

      const extension = await RentalService.createExtension({ booking_id, duration_months, user_id });
      return res.status(200).json({ success: true, extension });
    } catch (error) {
      console.error("[RentalController.createExtension] Error:", error);
      return res.status(500).json({ success: false, message: error.message || "Gagal melakukan perpanjangan sewa." });
    }
  }

  static async setWillNotExtend(req, res) {
    try {
      const { id } = req.params;
      const { will_not_extend } = req.body;

      if (will_not_extend === undefined) {
        return res.status(400).json({ success: false, message: "Status will_not_extend wajib dikirim." });
      }

      await RentalService.setWillNotExtend(id, will_not_extend);
      return res.status(200).json({ success: true, message: "Status perpanjangan berhasil diperbarui." });
    } catch (error) {
      console.error("[RentalController.setWillNotExtend] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal mengubah status perpanjangan." });
    }
  }

  static async checkLifecycles(req, res) {
    try {
      await RentalService.checkRentalLifecycles();
      return res.status(200).json({ success: true, message: "Lifecycle check successfully completed." });
    } catch (error) {
      console.error("[RentalController.checkLifecycles] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal menjalankan lifecycle check." });
    }
  }
}
