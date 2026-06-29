import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "raikos_db",
  });

  try {
    const [rows] = await conn.query("SHOW TABLES;");
    console.log("Tables in raikos_db:", rows);
  } catch (err) {
    console.error("Database connection/query error:", err);
  } finally {
    await conn.end();
  }
}

run();
