import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";

const router = Router();

router.get("/", ReportController.getAllReports);
router.post("/", ReportController.generateReport);

export default router;
