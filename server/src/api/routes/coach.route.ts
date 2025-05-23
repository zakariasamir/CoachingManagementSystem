import {
  getDashboardStats,
  listSessions,
  updateSession,
  listGoals,
  updateGoal,
  listOrganizations,
  listRequestedSessions,
  updateSessionStatus,
  getRequestedSession,
  getSessionById,
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
// List requested sessions
router.get("/sessions/requests", auth, listRequestedSessions as RequestHandler);
// Get session by id
router.get("/sessions/:sessionId", auth, getSessionById as RequestHandler);
// Update session
router.patch("/sessions/:sessionId", auth, updateSession as RequestHandler);
// List goals
router.get("/goals", auth, listGoals as RequestHandler);
// Update goal progress
router.patch("/goals/:goalId", auth, updateGoal as RequestHandler);
// list organizations
router.get("/organizations", auth, listOrganizations as RequestHandler);
// Get requested session
router.get(
  "/sessions/requests/:sessionId",
  auth,
  getRequestedSession as RequestHandler
);
// Update session status
router.patch(
  "/sessions/:sessionId/status",
  auth,
  updateSessionStatus as RequestHandler
);

export default router;
