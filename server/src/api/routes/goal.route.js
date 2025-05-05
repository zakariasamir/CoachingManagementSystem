import {Route} from "express";
const router = Route();
import {
  createGoal,
  // getGoals,
  getGoalById,
  updateGoal,
  addGoalUpdate,
} from "../controllers/goal.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
const auth = [authenticate, authorize(["coach", "manager", "enterpreneur"])];

router.post("/", auth, createGoal);
// router.get("/", auth, getGoals);
router.get("/:id", auth, getGoalById);
router.put("/:id", auth, updateGoal);
router.put("/:id/update", auth, addGoalUpdate);