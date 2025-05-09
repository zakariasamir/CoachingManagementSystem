import {
  getDashboardStats,
  listSessions,
  listUsers,
  listGoals,
  createSession,
  createGoal,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
} from "../controllers/manager.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const auth = [authenticate, authorize("manager", "admin")];
const router = Router();
// Dashboard stats
router.get("/dashboard", getDashboardStats);
// List sessions
router.get("/sessions", listSessions);
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
// Update user
router.put("/users/:userId", auth, updateUser);

export default router;
