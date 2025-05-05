import { Router } from "express";
const router = Router();
import {
  getUserProfile,
  updateUser,
  // deleteUser,
  getUsers,
} from "../controllers/user.controller.js";

router.get("/", getUsers);
router.get("/:id", getUserProfile);
router.put("/:id", updateUser);
// router.delete("/:id", deleteUser);

export default router;
