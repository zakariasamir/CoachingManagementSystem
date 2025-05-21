import {
  getDashboardStats,
  listSessions,
  listGoals,
  updateGoal,
  listOrganizations,
} from "../controllers/entrepreneur.controller";
import { Router, RequestHandler } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/role.middleware";

const auth = [
  authenticate as RequestHandler,
  authorize("entrepreneur") as RequestHandler,
];
const router = Router();

// Get dashboard stats
router.get("/dashboard", auth, getDashboardStats as RequestHandler);
// List sessions
router.get("/sessions", auth, listSessions as RequestHandler);
// List goals
router.get("/goals", auth, listGoals as RequestHandler);
// Update goal
router.put("/goals/:goalId", auth, updateGoal as RequestHandler);
// List organizations
router.get("/organizations", auth, listOrganizations as RequestHandler);

export default router;
