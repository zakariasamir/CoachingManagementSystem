import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
} from "../controllers/organization.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const auth = [authenticate, authorize(["admin", "manager"])];

const router = Router();

router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", auth, getOrganizationById);
router.delete("/:id", auth, deleteOrganization);

export default router;
