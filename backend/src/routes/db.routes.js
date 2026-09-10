import { Router } from "express";
import crypto from "node:crypto";
import { DbController } from "../controllers/db.controller.js";

const router = Router();

// Reset menghapus seluruh isi 9 tabel, jadi endpoint-nya harus terkunci.
// ADMIN_TOKEN hanya ada di env server -- tidak pernah ikut ke bundle frontend.
function requireAdminToken(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ success: false, message: "ADMIN_TOKEN belum diset di server." });
  }
  const given = String(req.get("x-admin-token") || "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ success: false, message: "Token admin tidak valid." });
  }
  next();
}

router.get("/db-status", DbController.getStatus);
router.post("/db/reset", requireAdminToken, DbController.reset);

export default router;
