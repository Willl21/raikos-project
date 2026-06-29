import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", PaymentController.getAllPayments);
router.post("/", upload.single("proof_image"), PaymentController.createPayment);
router.put("/:id", PaymentController.updatePayment);

export default router;
