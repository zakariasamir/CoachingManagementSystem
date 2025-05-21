import {
  getDashboardStats,
  listSessions,
  updateSession,
  listGoals,
  updateGoal,
  listOrganizations,
  listRequestedSessions,
  updateSessionStatus,
} from "../controllers/coach.controller";
import { Router, RequestHandler } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/role.middleware";

const auth = [
  authenticate as RequestHandler,
  authorize("coach") as RequestHandler,
];
const router = Router();

// Get dashboard stats
router.get("/dashboard", auth, getDashboardStats as RequestHandler);
// List sessions
router.get("/sessions", auth, listSessions as RequestHandler);
// Update session
router.patch("/sessions/:sessionId", auth, updateSession as RequestHandler);
// List goals
router.get("/goals", auth, listGoals as RequestHandler);
// Update goal
// router.put("/goals/:goalId", auth, updateGoal);
// Update goal progress
router.patch("/goals/:goalId", auth, updateGoal as RequestHandler);
// list organizations
router.get("/organizations", auth, listOrganizations as RequestHandler);
// List requested sessions
router.get("/sessions/requests", auth, listRequestedSessions as RequestHandler);
// Update session status
router.patch(
  "/sessions/:sessionId/status",
  auth,
  updateSessionStatus as RequestHandler
);

export default router;
