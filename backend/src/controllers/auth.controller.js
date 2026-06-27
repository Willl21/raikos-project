import { AuthService } from "../services/auth.service.js";

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email dan password wajib diisi!" });
      }

      const result = await AuthService.login(email, password);
      if (result) {
        return res.status(200).json(result);
      }

      return res.status(401).json({ success: false, message: "Email atau password salah!" });
    } catch (error) {
      console.error("[AuthController.login] Error:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
    }
  }

  static async register(req, res) {
    try {
      const { name, email, phone, nik, password } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, message: "Nama dan email wajib diisi!" });
      }

      const result = await AuthService.register({ name, email, phone, nik, password });
      return res.status(200).json(result);
    } catch (error) {
      console.error("[AuthController.register] Error:", error);
      if (error.message === "Email sudah terdaftar!") {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
    }
  }

  static async googleLogin(req, res) {
    try {
      const { name, email, googleAvatar } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email Google wajib dikirim!" });
      }

      const result = await AuthService.loginWithGoogle({ name, email, googleAvatar });
      return res.status(200).json(result);
    } catch (error) {
      console.error("[AuthController.googleLogin] Error:", error);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server." });
    }
  }
}
