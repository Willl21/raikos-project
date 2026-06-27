import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.join(__dirname, "../database/seed.sql");

export class DbService {
  static async getStatus() {
    const [[{ count: roomsCount }]] = await pool.query("SELECT COUNT(*) as count FROM rooms");
    const [[{ count: usersCount }]] = await pool.query("SELECT COUNT(*) as count FROM users");
    const [[{ count: bookingsCount }]] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const [[{ count: paymentsCount }]] = await pool.query("SELECT COUNT(*) as count FROM payments");

    return {
      status: "ready",
      roomsCount,
      usersCount,
      bookingsCount,
      paymentsCount
    };
  }

  static async reset() {
    if (!fs.existsSync(seedPath)) {
      throw new Error("File seed.sql tidak ditemukan!");
    }

    const seedSql = fs.readFileSync(seedPath, "utf-8");

    // Spawn a temporary connection to support multi-statement execution of seed.sql
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "raikos_db",
      multipleStatements: true
    });

    try {
      await tempConn.query(seedSql);
      return { success: true, message: "Database reset to seeded records successfully" };
    } catch (error) {
      console.error("Database reset failure:", error);
      throw error;
    } finally {
      await tempConn.end();
    }
  }
}
