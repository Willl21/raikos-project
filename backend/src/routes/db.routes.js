import { Router } from "express";
import { DbController } from "../controllers/db.controller.js";

const router = Router();

router.get("/db-status", DbController.getStatus);
router.post("/db/reset", DbController.reset);

export default router;
