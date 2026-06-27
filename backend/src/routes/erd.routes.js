import { Router } from "express";
import { ErdController } from "../controllers/erd.controller.js";

const router = Router();

router.get("/", ErdController.getErd);

export default router;
