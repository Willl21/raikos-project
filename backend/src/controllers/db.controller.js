import { DbService } from "../services/db.service.js";

export class DbController {
  static async getStatus(req, res) {
    try {
      const status = await DbService.getStatus();
      return res.status(200).json(status);
    } catch (error) {
      console.error("[DbController.getStatus] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat status database." });
    }
  }

  static async reset(req, res) {
    try {
      const result = await DbService.reset();
      return res.status(200).json(result);
    } catch (error) {
      console.error("[DbController.reset] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal mereset database ke kondisi awal." });
    }
  }
}
