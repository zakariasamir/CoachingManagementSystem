import { listSessions, listGoals, updateGoal } from "../controllers/coach.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
const auth = [authenticate, authorize("coach")];
const router = Router();
// List sessions
router.get("/sessions", auth, listSessions);
// List goals
router.get("/goals", auth, listGoals);
// Update goal
router.put("/goals/:goalId", auth, updateGoal);

export default router;