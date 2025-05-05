import { Router } from "express";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
} from "../controllers/organization.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorization.middleware.js";

const auth = [authenticate, authorize(["admin", "manager"])];

const router = Router();

router.post("/", auth, createOrganization);
router.get("/", auth, getOrganizations);
router.get("/:id", auth, getOrganizationById);
router.delete("/:id", auth, deleteOrganization);

export default router;
