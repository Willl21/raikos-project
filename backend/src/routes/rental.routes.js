import { Router } from "express";
import { RentalController } from "../controllers/rental.controller.js";

const router = Router();

router.get("/extensions", RentalController.getAllExtensions);
router.get("/extensions/user/:userId", RentalController.getExtensionsByUserId);
router.post("/extend", RentalController.createExtension);
// Admin: approve or reject a rental extension request
router.put("/extensions/:id", RentalController.updateExtensionStatus);
router.put("/bookings/:id/will-not-extend", RentalController.setWillNotExtend);
router.post("/check", RentalController.checkLifecycles);

export default router;
