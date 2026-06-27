import { RoomService } from "../services/room.service.js";

export class RoomController {
  static async getAllRooms(req, res) {
    try {
      const rooms = await RoomService.getAllRooms();
      return res.status(200).json(rooms);
    } catch (error) {
      console.error("[RoomController.getAllRooms] Error:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
    }
  }

  static async createRoom(req, res) {
    try {
      const room = await RoomService.createRoom(req.body);
      return res.status(201).json({ success: true, room });
    } catch (error) {
      console.error("[RoomController.createRoom] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal membuat kamar baru." });
    }
  }

  static async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const room = await RoomService.updateRoom(id, req.body);
      if (!room) {
        return res.status(404).json({ success: false, message: "Kamar tidak ditemukan" });
      }
      return res.status(200).json({ success: true, room });
    } catch (error) {
      console.error("[RoomController.updateRoom] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memperbarui kamar." });
    }
  }

  static async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const success = await RoomService.deleteRoom(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Kamar tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Kamar berhasil dihapus" });
    } catch (error) {
      console.error("[RoomController.deleteRoom] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal menghapus kamar." });
    }
  }
}
