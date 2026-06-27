import { ErdService } from "../services/erd.service.js";

export class ErdController {
  static getErd(req, res) {
    try {
      const erdData = ErdService.getErd();
      return res.status(200).json(erdData);
    } catch (error) {
      console.error("[ErdController.getErd] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat metadata ERD." });
    }
  }
}
