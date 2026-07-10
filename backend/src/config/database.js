import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

export const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || "localhost",
  port: Number(process.env.MYSQL_ADDON_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_ADDON_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME || "raikos_db",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  namedPlaceholders: false,
});
