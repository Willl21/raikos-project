import { ReportService } from "../services/report.service.js";

export class ReportController {
  static async getAllReports(req, res) {
    try {
      const reports = await ReportService.getAllReports();
      return res.status(200).json(reports);
    } catch (error) {
      console.error("[ReportController.getAllReports] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat daftar laporan." });
    }
  }

  static async generateReport(req, res) {
    try {
      const { type, title } = req.body;
      if (!type) {
        return res.status(400).json({ success: false, message: "Tipe laporan wajib diisi!" });
      }

      const report = await ReportService.generateReport(type, title);
      return res.status(201).json({ success: true, report });
    } catch (error) {
      console.error("[ReportController.generateReport] Error:", error);
      return res.status(500).json({ success: false, message: error.message || "Gagal menyusun laporan baru." });
    }
  }
}
