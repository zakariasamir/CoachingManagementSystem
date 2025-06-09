import {
  getDashboardStats,
  listOrganizations,
  listAllOrganizations,
  listSessions,
  listUsers,
  listGoals,
  createOrganization,
  createSession,
  // createGoal,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
  updateUserStatus,
  addUserToOrganization,
  getSessionById,
  listInvoices,
  processInvoice,
  getCoachAvailability,
} from "../controllers/manager.controller";
import { Router, RequestHandler } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/role.middleware";
import {
  userValidation,
  sessionValidation,
  organizationValidation,
  goalValidation,
} from "../middlewares/validation.middleware";
import { AuthenticatedRequest } from "../types/index";

const auth = [
  authenticate as RequestHandler,
  authorize("manager", "admin") as RequestHandler,
];
const router = Router();

// Get coach availability
router.get(
  "/coach/:coachId/availability",
  auth,
  getCoachAvailability as RequestHandler
);

// Dashboard stats
router.get(
  "/dashboard/:organizationId",
  auth,
  getDashboardStats as RequestHandler
);
// List organizations
router.get("/organizations", auth, listOrganizations as RequestHandler);
// List all organizations
router.get("/organizations/all", auth, listAllOrganizations as RequestHandler);
// List sessions
router.get("/sessions", auth, listSessions as RequestHandler);
// Get session by id
router.get("/sessions/:sessionId", auth, getSessionById as RequestHandler);
// List users
router.get("/users", auth, listUsers as RequestHandler);
// List goals
router.get("/goals", auth, listGoals as RequestHandler);
// Create session
router.post(
  "/sessions",
  auth,
  sessionValidation.createSession as RequestHandler,
  createSession as RequestHandler
);
// List payments
router.get("/payments", auth, listPayments as RequestHandler);
// Generate invoice
router.post("/invoices", auth, generateInvoice as RequestHandler);
// Create user
router.post(
  "/users",
  auth,
  userValidation.createUser as RequestHandler,
  createUser as RequestHandler
);
// Create organization
router.post(
  "/organizations",
  auth,
  organizationValidation.createOrganization as RequestHandler,
  createOrganization as RequestHandler
);
// Add user to organization
router.post(
  "/organizations/users",
  auth,
  organizationValidation.addUserToOrganization as RequestHandler,
  addUserToOrganization as RequestHandler
);
// Update user status
router.patch(
  "/users/:userId/status",
  auth,
  userValidation.updateUserStatus as RequestHandler,
  updateUserStatus as RequestHandler
);
// Update user
router.put(
  "/users/:userId",
  auth,
  userValidation.updateUser as RequestHandler,
  updateUser as RequestHandler
);
// List invoices
router.get("/invoices", auth, listInvoices as RequestHandler);
// Process invoice
router.patch(
  "/invoices/:invoiceId/process",
  auth,
  processInvoice as RequestHandler
);

export default router;
