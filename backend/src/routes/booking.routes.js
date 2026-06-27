import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";

const router = Router();

router.get("/", BookingController.getAllBookings);
router.post("/", BookingController.createBooking);
router.put("/:id", BookingController.updateBooking);

export default router;
