import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import dbRoutes from "./routes/db.routes.js";
import erdRoutes from "./routes/erd.routes.js";
import rentalRoutes from "./routes/rental.routes.js"; // NEW
import { RentalService } from "./services/rental.service.js"; // NEW
import { requestMiddleware } from "./middleware/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendRoot = path.join(projectRoot, "frontend");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(projectRoot, "backend/public")));
// Serve uploaded payment proof images as static files
app.use("/uploads", express.static(path.join(projectRoot, "uploads")));
app.use(requestMiddleware);

// Initialize DB Extensions and run initial lifecycle check
RentalService.initializeDatabaseExtensions().then(() => {
  console.log("[RentalSystem] Database schema check completed.");
  RentalService.checkRentalLifecycles().then(() => {
    console.log("[RentalSystem] Initial rental lifecycle expiration check completed.");
  });
});

// Run lifecycle checker every hour
setInterval(() => {
  console.log("[RentalSystem] Running hourly rental lifecycle checks...");
  RentalService.checkRentalLifecycles();
}, 60 * 60 * 1000);

// Pre-hook middleware to ensure database lifecycle state is always synced before returning list data
app.use(["/api/bookings", "/api/tenants", "/api/payments", "/api/rentals/extensions"], async (req, res, next) => {
  try {
    await RentalService.checkRentalLifecycles();
  } catch (err) {
    console.error("[LifecycleMiddleware] Error during sync:", err);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rentals", rentalRoutes); // NEW
app.use("/api", dbRoutes);
app.use("/api/erd", erdRoutes);

if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    root: frontendRoot,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(frontendRoot, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
