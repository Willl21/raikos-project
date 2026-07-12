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

  // ── NEW: Get realtime report statistics ──
  static async getReportStats(req, res) {
    try {
      const stats = await ReportService.getReportStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("[ReportController.getReportStats] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat statistik laporan." });
    }
  }

  // ── NEW: Download report as CSV file ──
  static async downloadReportCSV(req, res) {
    try {
      const { type } = req.params;
      const validTypes = ["penyewa", "kamar", "pembayaran", "pemesanan"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: "Tipe laporan tidak valid!" });
      }

      const { headers, rows } = await ReportService.getReportCSVData(type);

      // Build CSV content with BOM for Excel compatibility
      const BOM = "\uFEFF";
      const escapeCsvField = (field) => {
        const str = String(field == null ? "" : field);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const csvLines = [
        "sep=,",
        headers.map(escapeCsvField).join(","),
        ...rows.map((row) => row.map(escapeCsvField).join(","))
      ];
      const csvContent = BOM + csvLines.join("\r\n");

      const fileNames = {
        penyewa: "laporan-penyewa.csv",
        kamar: "laporan-kamar.csv",
        pembayaran: "laporan-pembayaran.csv",
        pemesanan: "laporan-pemesanan.csv"
      };

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${fileNames[type]}"`);
      return res.status(200).send(csvContent);
    } catch (error) {
      console.error("[ReportController.downloadReportCSV] Error:", error);
      return res.status(500).json({ success: false, message: error.message || "Gagal mengunduh laporan CSV." });
    }
  }
}
