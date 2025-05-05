import { Router } from "express";
import {
  createSession,
  updateSessionStatus,
  getSessions,
} from "../controllers/session.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const auth = [authenticate, authorize(["manager", "admin"])];

const router = Router();

router.post("/", auth, createSession);
router.put("/:id/status", auth, updateSessionStatus);
router.get("/", auth, getSessions);
router.get("/:id", auth, getSessions);

export default router;
