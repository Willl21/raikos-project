import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";

const router = Router();

router.get("/", TenantController.getAllTenants);
router.post("/", TenantController.createTenant);
router.put("/:id", TenantController.updateTenant);
router.delete("/:id", TenantController.deleteTenant);

export default router;
