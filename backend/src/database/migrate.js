import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

// Load env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
};

async function migrate() {
  console.log("[Migration] Starting database migration...");
  let connection;
  try {
    // 1. Connect without database first to ensure database exists
    connection = await mysql.createConnection(dbConfig);
    
    console.log("[Migration] Creating database if not exists...");
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "raikos_db"}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME || "raikos_db"}\`;`);

    // 2. Run schema.sql
    console.log("[Migration] Running schema.sql...");
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await connection.query(schemaSql);
    console.log("[Migration] Schema created successfully.");

    // 3. Check for db.json and verify it's not empty
    const dbJsonPath = path.join(projectRoot, "db.json");
    if (fs.existsSync(dbJsonPath) && fs.statSync(dbJsonPath).size > 0) {
      console.log(`[Migration] Found existing non-empty db.json at ${dbJsonPath}. Migrating current records...`);
      const rawData = fs.readFileSync(dbJsonPath, "utf-8");
      const dbData = JSON.parse(rawData);

      // Disable foreign key checks to avoid ordering issues during insert
      await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
      
      // Clear existing records before migration to prevent duplicate key errors
      await connection.query("TRUNCATE TABLE room_images;");
      await connection.query("TRUNCATE TABLE payments;");
      await connection.query("TRUNCATE TABLE rental_extensions;");
      await connection.query("TRUNCATE TABLE bookings;");
      await connection.query("TRUNCATE TABLE notifications;");
      await connection.query("TRUNCATE TABLE reports;");
      await connection.query("TRUNCATE TABLE rooms;");
      await connection.query("TRUNCATE TABLE users;");
      await connection.query("TRUNCATE TABLE admins;");

      // Insert Admins
      if (Array.isArray(dbData.admins)) {
        console.log(`[Migration] Migrating ${dbData.admins.length} admins...`);
        for (const a of dbData.admins) {
          await connection.query(
            "INSERT INTO admins (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [a.id, a.name, a.email, a.password, a.role || "admin"]
          );
        }
      }

      // Insert Users
      if (Array.isArray(dbData.users)) {
        console.log(`[Migration] Migrating ${dbData.users.length} users...`);
        for (const u of dbData.users) {
          await connection.query(
            "INSERT INTO users (id, name, email, password, phone, nik, avatar, uploaded_avatar, google_avatar, is_google_login, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              u.id, 
              u.name, 
              u.email, 
              u.password, 
              u.phone || "", 
              u.nik || "", 
              u.avatar || null, 
              u.uploadedAvatar || null, 
              u.googleAvatar || null, 
              u.isGoogleLogin === true || u.isGoogleLogin === "true" ? 1 : 0, 
              u.role || "tenant"
            ]
          );
        }
      }

      // Insert Rooms & Room Images
      if (Array.isArray(dbData.rooms)) {
        console.log(`[Migration] Migrating ${dbData.rooms.length} rooms...`);
        for (const r of dbData.rooms) {
          await connection.query(
            "INSERT INTO rooms (id, name, type, price_monthly, price_yearly, description, status, wifi, bathroom_inside, electricity_token, water_independent, lrt_nearby, parking_area, security) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              r.id,
              r.name,
              r.type,
              Number(r.price_monthly) || 0,
              Number(r.price_yearly) || 0,
              r.description || "",
              r.status || "tersedia",
              r.wifi ? 1 : 0,
              r.bathroom_inside ? 1 : 0,
              r.electricity_token ? 1 : 0,
              r.water_independent ? 1 : 0,
              r.lrt_nearby ? 1 : 0,
              r.parking_area ? 1 : 0,
              r.security ? 1 : 0
            ]
          );

          // Insert room images
          if (Array.isArray(r.images)) {
            for (const imgUrl of r.images) {
              await connection.query(
                "INSERT INTO room_images (room_id, image_url) VALUES (?, ?)",
                [r.id, imgUrl]
              );
            }
          }
        }
      }

      // Insert Bookings
      if (Array.isArray(dbData.bookings)) {
        console.log(`[Migration] Migrating ${dbData.bookings.length} bookings...`);
        for (const b of dbData.bookings) {
          await connection.query(
            "INSERT INTO bookings (id, user_id, room_id, name, email, phone, nik, entry_date, duration_months, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              b.id,
              b.user_id,
              b.room_id,
              b.name,
              b.email,
              b.phone || "",
              b.nik || "",
              b.entry_date,
              Number(b.duration_months) || 1,
              Number(b.total_price) || 0,
              b.status || "pending",
              b.created_at ? new Date(b.created_at) : new Date()
            ]
          );
        }
      }

      // Insert Payments
      if (Array.isArray(dbData.payments)) {
        console.log(`[Migration] Migrating ${dbData.payments.length} payments...`);
        for (const p of dbData.payments) {
          await connection.query(
            "INSERT INTO payments (id, booking_id, user_id, amount, payment_method, proof_image, meeting_date, status, billing_month, billing_year, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
              p.id,
              p.booking_id,
              p.user_id,
              Number(p.amount) || 0,
              p.payment_method,
              p.proof_image || null,
              p.meeting_date || null,
              p.status || "pending",
              p.billing_month,
              p.billing_year,
              p.created_at ? new Date(p.created_at) : new Date()
            ]
          );
        }
      }

      // Insert Notifications
      if (Array.isArray(dbData.notifications)) {
        console.log(`[Migration] Migrating ${dbData.notifications.length} notifications...`);
        for (const n of dbData.notifications) {
          await connection.query(
            "INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
              n.id,
              n.user_id,
              n.title,
              n.message,
              n.is_read ? 1 : 0,
              n.created_at ? new Date(n.created_at) : new Date()
            ]
          );
        }
      }

      // Re-enable foreign key checks
      await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
      console.log("[Migration] Migration of db.json records completed successfully.");
    } else {
      console.log("[Migration] db.json not found. Seeding database with default records from seed.sql...");
      const seedPath = path.join(__dirname, "seed.sql");
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      await connection.query(seedSql);
      console.log("[Migration] Database seeded successfully.");
    }

  } catch (error) {
    console.error("[Migration] Error during migration:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    console.log("[Migration] Database migration process finished.");
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  migrate();
}

export { migrate };
