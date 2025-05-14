import {
  getDashboardStats,
  listOrganizations,
  listSessions,
  listUsers,
  listGoals,
  createOrganization,
  createSession,
  createGoal,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
  updateUserStatus,
  addUserToOrganization,
} from "../controllers/manager.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const auth = [authenticate, authorize("manager", "admin")];
const router = Router();
// Dashboard stats
router.get("/dashboard", getDashboardStats);
// List organizations
router.get("/organizations", auth, listOrganizations);
// List sessions
router.get("/sessions", auth, listSessions);
// List users
router.get("/users", auth, listUsers);
// List goals
router.get("/goals", auth, listGoals);
// Create session
router.post("/sessions", auth, createSession);
// Create goal
router.post("/goals", auth, createGoal);
// List payments
router.get("/payments", auth, listPayments);
// Generate invoice
router.post("/invoices", auth, generateInvoice);
// Create user
router.post("/users", auth, createUser);
// Create organization
router.post("/organizations", auth, createOrganization);
// Add user to organization
router.post("/organizations/users", auth, addUserToOrganization);
// Update user status
router.patch("/users/:userId/status", auth, updateUserStatus);
// Update user
router.put("/users/:userId", auth, updateUser);

export default router;
