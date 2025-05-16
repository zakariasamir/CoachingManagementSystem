import {
  getDashboardStats,
  listSessions,
  updateSession,
  listGoals,
  updateGoal,
  // updateGoalProgress,
  listOrganizations,
} from "../controllers/coach.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
const auth = [authenticate, authorize("coach")];
const router = Router();
// Get dashboard stats
router.get("/dashboard", auth, getDashboardStats);
// List sessions
router.get("/sessions", auth, listSessions);
// Update session
router.patch("/sessions/:sessionId", auth, updateSession);
// List goals
router.get("/goals", auth, listGoals);
// Update goal
// router.put("/goals/:goalId", auth, updateGoal);
// Update goal progress
router.patch("/goals/:goalId", auth, updateGoal);
// list organizations
router.get("/organizations", auth, listOrganizations);

export default router;
