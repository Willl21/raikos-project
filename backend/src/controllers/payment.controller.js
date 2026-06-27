import { PaymentService } from "../services/payment.service.js";

export class PaymentController {
  static async getAllPayments(req, res) {
    try {
      const payments = await PaymentService.getAllPayments();
      return res.status(200).json(payments);
    } catch (error) {
      console.error("[PaymentController.getAllPayments] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat daftar pembayaran." });
    }
  }

  static async createPayment(req, res) {
    try {
      const payment = await PaymentService.createPayment(req.body);
      return res.status(200).json({ success: true, payment });
    } catch (error) {
      console.error("[PaymentController.createPayment] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal mengunggah bukti pembayaran." });
    }
  }

  static async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "Status pembayaran wajib dikirim!" });
      }

      const payment = await PaymentService.updatePayment(id, status);
      return res.status(200).json({ success: true, payment });
    } catch (error) {
      console.error("[PaymentController.updatePayment] Error:", error);
      if (error.message === "Pembayaran tidak ditemukan") {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: "Gagal memperbarui status pembayaran." });
    }
  }
}
