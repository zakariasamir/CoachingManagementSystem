import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { Goal } from "../models/goal.model.js";
import { Session } from "../models/session.model.js";

const listSessions = async (req, res) => {
  const { userId } = req.user;
  try {
    const sessions = await SessionParticipant.find({
      userId,
      role: "entrepreneur",
    }).populate({
      path: "sessionId",
      populate: {
        path: "participants",
        populate: {
          path: "userId",
          select: "firstName lastName email",
        },
      },
    });

    res.status(200).json(sessions.map((sp) => sp.sessionId));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sessions", error: error.message });
  }
};

const listGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ entrepreneurId: req.user.userId })
      .populate("coachId", "firstName lastName email")
      .populate("organizationId", "name");
    res.status(200).json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching goals", error: error.message });
  }
};

const updateGoal = async (req, res) => {
  const { goalId } = req.params;
  const { Progress, status } = req.body;

  try {
    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { Progress, status },
      { new: true }
    ).populate("coachId", "firstName lastName email");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating goal", error: error.message });
  }
};

export { listSessions, listGoals, updateGoal };
