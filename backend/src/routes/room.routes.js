import { Router } from "express";
import { RoomController } from "../controllers/room.controller.js";

const router = Router();

router.get("/", RoomController.getAllRooms);
router.post("/", RoomController.createRoom);
router.put("/:id", RoomController.updateRoom);
router.delete("/:id", RoomController.deleteRoom);

export default router;
