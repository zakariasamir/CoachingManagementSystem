import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { Goal } from "../models/goal.model.js";
import { Session } from "../models/session.model.js";
import { SessionOrganization } from "../models/sessionOrganization.model.js";
import { Organization } from "../models/organization.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";

const getDashboardStats = async (req, res) => {
  const { organizationId } = req.query;
  const { userId } = req.user;

  try {
    // Get all entrepreneur's sessions in the organization
    const entrepreneurSessions = await SessionParticipant.find({
      userId,
      role: "entrepreneur",
    });
    const sessionIds = entrepreneurSessions.map((cs) => cs.sessionId);

    // Filter sessions by organization
    const orgSessions = await SessionOrganization.find({
      organizationId,
      sessionId: { $in: sessionIds },
    });
    const orgSessionIds = orgSessions.map((os) => os.sessionId);

    // Count total sessions in the organization
    const totalSessions = await Session.countDocuments({
      _id: { $in: orgSessionIds },
    });

    // Get entrepreneur's goals in the organization
    const entrepreneurGoals = await Goal.find({
      entrepreneurId: userId,
      organizationId,
    });

    // Count completed goals
    const completedGoals = entrepreneurGoals.filter(
      (goal) => goal.status === "completed"
    ).length;

    // Count total goals
    const totalGoals = entrepreneurGoals.length;

    res.status(200).json({
      totalSessions,
      completedGoals,
      totalGoals,
      activeGoals: totalGoals - completedGoals,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

const listSessions = async (req, res) => {
  const { userId } = req.user;
  const { organizationId } = req.query;
  try {
    const sessionParticipants = await SessionParticipant.find({
      userId,
      role: "entrepreneur",
    });

    const sessionIds = sessionParticipants.map((sp) => sp.sessionId);

    const sessions = await Session.find({
      _id: { $in: sessionIds },
    });

    const orgSessions = await SessionOrganization.find({
      organizationId,
      sessionId: { $in: sessionIds },
    });

    const participants = await SessionParticipant.find({
      sessionId: { $in: sessionIds },
    }).populate("userId", "firstName lastName email");
    const orgSessionIds = orgSessions.map((os) => os.sessionId.toString());

    const filteredSessions = sessions.filter((session) =>
      orgSessionIds.includes(session._id.toString())
    );
    const sessionsWithParticipants = filteredSessions.map((session) => ({
      ...session.toObject(),
      participants: participants.filter(
        (p) => p.sessionId.toString() === session._id.toString()
      ),
    }));

    res.status(200).json(sessionsWithParticipants);
  } catch (error) {
    console.error("Error in listSessions:", error);
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message,
    });
  }
};

const listGoals = async (req, res) => {
  const { organizationId } = req.query;
  const { userId } = req.user;

  try {
    const goals = await Goal.find({
      entrepreneurId: userId,
      organizationId,
    })
      .populate("coachId", "firstName lastName email")
      .populate("organizationId", "name");

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error in listGoals:", error);
    res.status(500).json({
      message: "Error fetching goals",
      error: error.message,
    });
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
const listOrganizations = async (req, res) => {
  try {
    const orgUsers = await OrganizationUser.find({
      userId: req.user.userId,
      status: "active",
    }).populate("organizationId", "name isSelected");

    const userOrganizations = orgUsers.map((orgUser) => ({
      id: orgUser.organizationId._id,
      name: orgUser.organizationId.name,
      isSelected: orgUser.isSelected,
      role: orgUser.role,
    }));

    res.status(200).json(userOrganizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error.message,
    });
  }
};

export {
  getDashboardStats,
  listSessions,
  listGoals,
  updateGoal,
  listOrganizations,
};
