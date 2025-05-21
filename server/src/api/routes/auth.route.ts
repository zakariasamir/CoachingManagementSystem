import {
  register,
  login,
  logout,
  checkAuthStatus,
  switchOrganization,
} from "../controllers/auth.controller";
import authenticate from "../middlewares/auth.middleware";
import { Router, RequestHandler } from "express";
import { authValidation } from "../middlewares/validation.middleware";

const router = Router();

router.post(
  "/register",
  authValidation.register as RequestHandler,
  register as RequestHandler
);
router.post(
  "/login",
  authValidation.login as RequestHandler,
  login as RequestHandler
);
router.post("/logout", logout as RequestHandler);
router.get(
  "/check-auth-status",
  authenticate as RequestHandler,
  checkAuthStatus as RequestHandler
);
router.post(
  "/switch-organization",
  authenticate as RequestHandler,
  authValidation.switchOrganization as RequestHandler,
  switchOrganization as RequestHandler
);

export default router;
