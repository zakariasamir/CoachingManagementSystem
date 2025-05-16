import {
  getDashboardStats,
  listSessions,
  listGoals,
  updateGoal,
  listOrganizations
} from "../controllers/entrepreneur.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
const auth = [authenticate, authorize("entrepreneur")];
const router = Router();
// Get dashboard stats
router.get("/dashboard", auth, getDashboardStats);
// List sessions
router.get("/sessions", auth, listSessions);
// List goals
router.get("/goals", auth, listGoals);
// Update goal
router.put("/goals/:goalId", auth, updateGoal);
// List organizations
router.get("/organizations", auth, listOrganizations);

export default router;
