import {
  register,
  login,
  logout,
  checkAuthStatus,
  switchOrganization,
} from "../controllers/auth.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-auth-status", authenticate, checkAuthStatus);
router.post("/switch-organization", authenticate, switchOrganization);

export default router;
