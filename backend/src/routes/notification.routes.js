import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";

const router = Router();

router.get("/:userId", NotificationController.getNotificationsByUserId);
router.put("/read/:id", NotificationController.markAsRead);
router.put("/read-all/:userId", NotificationController.markAllAsRead);

export default router;
