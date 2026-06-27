import { pool } from "../config/database.js";
import { generateId } from "../utils/generateId.js";
import { removePassword } from "../utils/helpers.js";

export class AuthService {
  static async login(email, password) {
    // 1. Check if admin
    const [admins] = await pool.query(
      "SELECT * FROM admins WHERE email = ? AND password = ?",
      [email, password]
    );
    
    if (admins.length > 0) {
      const adminClean = removePassword(admins[0]);
      return { success: true, user: adminClean, token: "admin-jwt" };
    }

    // 2. Check if tenant/user
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length > 0) {
      const user = users[0];
      const userClean = {
        ...removePassword(user),
        isGoogleLogin: user.is_google_login === 1 || user.is_google_login === true,
        googleAvatar: user.google_avatar,
        uploadedAvatar: user.uploaded_avatar
      };
      return { success: true, user: userClean, token: "tenant-jwt" };
    }

    return null;
  }

  static async register({ name, email, phone, nik, password }) {
    // Check if email already registered in users
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error("Email sudah terdaftar!");
    }

    const userId = generateId("usr");
    const avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150";
    const pass = password || "penyewa";

    await pool.query(
      "INSERT INTO users (id, name, email, password, phone, nik, avatar, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, name, email, pass, phone || "", nik || "", avatar, "tenant"]
    );

    const newUser = {
      id: userId,
      name,
      email,
      phone: phone || "",
      nik: nik || "",
      avatar,
      isGoogleLogin: false,
      role: "tenant"
    };

    return { success: true, user: newUser, token: "tenant-jwt" };
  }

  static async loginWithGoogle({ name, email, googleAvatar }) {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;
    if (users.length > 0) {
      // Existing user: update google details
      const existingUser = users[0];
      const uploadedAvatar = existingUser.uploaded_avatar;
      const resolvedGoogleAvatar = googleAvatar !== undefined ? googleAvatar : existingUser.google_avatar;
      const finalAvatar = uploadedAvatar || resolvedGoogleAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

      await pool.query(
        "UPDATE users SET is_google_login = ?, google_avatar = ?, avatar = ? WHERE id = ?",
        [1, resolvedGoogleAvatar, finalAvatar, existingUser.id]
      );

      // Re-fetch updated user
      const [updatedUsers] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [existingUser.id]
      );
      user = updatedUsers[0];
    } else {
      // New user: insert
      const userId = generateId("usr");
      const defaultAv = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
      const resolvedAvatar = googleAvatar || defaultAv;
      const randomPassword = `google-${Date.now()}`;

      await pool.query(
        "INSERT INTO users (id, name, email, password, phone, nik, avatar, google_avatar, is_google_login, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, name || "Pengguna Google", email, randomPassword, "", "", resolvedAvatar, googleAvatar || null, 1, "tenant"]
      );

      const [newUsers] = await pool.query(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );
      user = newUsers[0];
    }

    const userClean = {
      ...removePassword(user),
      isGoogleLogin: user.is_google_login === 1 || user.is_google_login === true,
      googleAvatar: user.google_avatar,
      uploadedAvatar: user.uploaded_avatar
    };

    return { success: true, user: userClean, token: "tenant-jwt" };
  }
}
