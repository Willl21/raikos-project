import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";
import { removePassword } from "../utils/helpers.js";

export class TenantService {
  static async getAllTenants() {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY name ASC");
    return rows.map((u) => ({
      ...removePassword(u),
      isGoogleLogin: u.is_google_login === 1 || u.is_google_login === true,
      googleAvatar: u.google_avatar,
      uploadedAvatar: u.uploaded_avatar
    }));
  }

  static async getTenantById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const u = rows[0];
    return {
      ...removePassword(u),
      isGoogleLogin: u.is_google_login === 1 || u.is_google_login === true,
      googleAvatar: u.google_avatar,
      uploadedAvatar: u.uploaded_avatar
    };
  }

  static async createTenant(tData) {
    const tenantId = generateId("usr");
    const name = tData.name;
    const email = tData.email;
    const phone = tData.phone || "";
    const nik = tData.nik || "";
    const avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    const password = tData.password || "penyewa";

    await pool.query(
      `INSERT INTO users (id, name, email, password, phone, nik, avatar, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'tenant')`,
      [tenantId, name, email, password, phone, nik, avatar]
    );

    return {
      id: tenantId,
      name,
      email,
      phone,
      nik,
      avatar,
      isGoogleLogin: false,
      role: "tenant"
    };
  }

  static async updateTenant(id, tData) {
    const existing = await this.getTenantById(id);
    if (!existing) return null;

    // Get current fields from DB
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    const current = rows[0];

    const name = tData.name !== undefined ? tData.name : current.name;
    const email = tData.email !== undefined ? tData.email : current.email;
    const phone = tData.phone !== undefined ? tData.phone : current.phone;
    const nik = tData.nik !== undefined ? tData.nik : current.nik;
    
    // Avatar logic
    const isGoogleLogin = tData.isGoogleLogin !== undefined ? (tData.isGoogleLogin ? 1 : 0) : current.is_google_login;
    const googleAvatar = tData.googleAvatar !== undefined ? tData.googleAvatar : current.google_avatar;
    
    let uploadedAvatar = current.uploaded_avatar;
    if (tData.hasOwnProperty("uploadedAvatar")) {
      uploadedAvatar = tData.uploadedAvatar; // can be null or string
    }

    const defaultAv = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    const resolvedAvatar = uploadedAvatar || googleAvatar || defaultAv;

    await pool.query(
      `UPDATE users SET 
        name = ?, email = ?, phone = ?, nik = ?, 
        uploaded_avatar = ?, google_avatar = ?, is_google_login = ?, avatar = ?
       WHERE id = ?`,
      [
        name, email, phone, nik, 
        uploadedAvatar, googleAvatar, isGoogleLogin, resolvedAvatar, 
        id
      ]
    );

    return {
      id,
      name,
      email,
      phone,
      nik,
      uploadedAvatar,
      googleAvatar,
      isGoogleLogin: isGoogleLogin === 1 || isGoogleLogin === true,
      avatar: resolvedAvatar,
      role: current.role
    };
  }

  static async deleteTenant(id) {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
