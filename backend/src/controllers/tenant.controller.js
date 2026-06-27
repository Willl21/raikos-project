import { TenantService } from "../services/tenant.service.js";

export class TenantController {
  static async getAllTenants(req, res) {
    try {
      const tenants = await TenantService.getAllTenants();
      return res.status(200).json(tenants);
    } catch (error) {
      console.error("[TenantController.getAllTenants] Error:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan saat memuat daftar penyewa." });
    }
  }

  static async createTenant(req, res) {
    try {
      const tenant = await TenantService.createTenant(req.body);
      return res.status(200).json({ success: true, tenant });
    } catch (error) {
      console.error("[TenantController.createTenant] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal menambahkan penyewa." });
    }
  }

  static async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const tenant = await TenantService.updateTenant(id, req.body);
      if (!tenant) {
        return res.status(404).json({ success: false, message: "Penyewa tidak ditemukan" });
      }
      return res.status(200).json({ success: true, tenant });
    } catch (error) {
      console.error("[TenantController.updateTenant] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal memperbarui data penyewa." });
    }
  }

  static async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      const success = await TenantService.deleteTenant(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "Penyewa tidak ditemukan" });
      }
      return res.status(200).json({ success: true, message: "Penyewa berhasil dihapus" });
    } catch (error) {
      console.error("[TenantController.deleteTenant] Error:", error);
      return res.status(500).json({ success: false, message: "Gagal menghapus penyewa." });
    }
  }
}
