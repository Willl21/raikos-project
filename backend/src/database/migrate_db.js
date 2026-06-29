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
    console.log("Starting DB Alterations...");

    // 1. Add meeting_date column to payments table if it doesn't exist
    const [columns] = await conn.query("SHOW COLUMNS FROM payments;");
    const hasMeetingDate = columns.some(col => col.Field === "meeting_date");
    if (!hasMeetingDate) {
      console.log("Adding 'meeting_date' column to payments table...");
      await conn.query("ALTER TABLE payments ADD COLUMN meeting_date DATE NULL;");
    } else {
      console.log("'meeting_date' column already exists in payments table.");
    }

    // 2. Set default status of rooms to 'Tersedia'
    console.log("Setting default room status to 'Tersedia'...");
    await conn.query("ALTER TABLE rooms ALTER status SET DEFAULT 'Tersedia';");

    // 3. Migrate existing rooms data
    console.log("Migrating existing room status data...");
    await conn.query("UPDATE rooms SET status = 'Tersedia' WHERE status = 'tersedia' OR status IS NULL;");
    await conn.query("UPDATE rooms SET status = 'BOOKED' WHERE status = 'dipesan';");
    await conn.query("UPDATE rooms SET status = 'Terisi' WHERE status = 'terisi';");

    // 4. Migrate existing bookings data
    console.log("Migrating existing bookings status data...");
    await conn.query("UPDATE bookings SET status = 'Pending Approval' WHERE status = 'pending' OR status IS NULL;");
    await conn.query("UPDATE bookings SET status = 'Approved' WHERE status = 'confirmed';");
    // rejected stays Rejected (or capitalize it)
    await conn.query("UPDATE bookings SET status = 'Rejected' WHERE status = 'rejected';");

    // 5. Migrate existing payments data
    console.log("Migrating existing payments status data...");
    await conn.query("UPDATE payments SET status = 'Waiting Verification' WHERE status = 'pending' OR status IS NULL;");
    await conn.query("UPDATE payments SET status = 'Paid' WHERE status = 'approved';");
    await conn.query("UPDATE payments SET status = 'Rejected' WHERE status = 'rejected';");

    console.log("DB Alterations completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await conn.end();
  }
}

run();
