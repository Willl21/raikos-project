import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";

const router = Router();

router.get("/", PaymentController.getAllPayments);
router.post("/", PaymentController.createPayment);
router.put("/:id", PaymentController.updatePayment);

export default router;
