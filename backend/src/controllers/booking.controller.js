import { BookingService } from "../services/booking.service.js";

export class BookingController {
  static async getAllBookings(req, res) {
    try {
      const bookings = await BookingService.getAllBookings();
      return res.status(200).json(bookings);
    } catch (error) {
      console.error("[BookingController.getAllBookings] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memuat daftar pemesanan." });
    }
  }

  static async createBooking(req, res) {
    try {
      const booking = await BookingService.createBooking(req.body);
      return res.status(200).json({ success: true, booking });
    } catch (error) {
      console.error("[BookingController.createBooking] Error:", error);
      if (error.message === "Kamar tidak ditemukan") {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (
        error.message === "Tanggal masuk minimal 3 hari setelah tanggal booking" ||
        error.message === "Tanggal masuk wajib diisi" ||
        error.message === "Kamar tidak tersedia untuk dipesan"
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: "Gagal melakukan pemesanan kamar." });
    }
  }

  static async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "Status pemesanan wajib dikirim!" });
      }

      const booking = await BookingService.updateBooking(id, status);
      return res.status(200).json({ success: true, booking });
    } catch (error) {
      console.error("[BookingController.updateBooking] Error:", error);
      if (error.message === "Booking tidak ditemukan") {
        return res.status(404).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: "Gagal memperbarui status pemesanan." });
    }
  }
}
