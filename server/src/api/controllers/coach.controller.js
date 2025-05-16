import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { SessionOrganization } from "../models/sessionOrganization.model.js";
import { Organization } from "../models/organization.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";
import { Goal } from "../models/goal.model.js";
import { Session } from "../models/session.model.js";

const getDashboardStats = async (req, res) => {
  const { userId } = req.user;
  try {
    const coachSessions = await SessionParticipant.find({
      userId,
      role: "coach",
    });
    const sessionIds = coachSessions.map((cs) => cs.sessionId);
    const totalSessions = await Session.countDocuments({
      _id: { $in: sessionIds },
    });
    const completedSessions = await Session.countDocuments({
      _id: { $in: sessionIds },
      status: "completed",
    });
    const totalGoals = await Goal.countDocuments({
      coachId: userId,
    });

    res.status(200).json({
      totalSessions,
      completedSessions,
      totalGoals,
    });
  } catch (error) {
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
      role: "coach",
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

const updateSession = async (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body;
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error("Error in updateSession:", error);
    res.status(500).json({
      message: "Error updating session",
      error: error.message,
    });
  }
};

const listGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ coachId: req.user.userId })
      .populate("entrepreneurId", "firstName lastName email")
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
  const { title, description, Progress, status } = req.body;

  try {
    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { title, description, Progress, status },
      { new: true }
    ).populate("entrepreneurId", "firstName lastName email");

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

const updateGoalProgress = async (req, res) => {
  const { goalId } = req.params;
  const { progress } = req.body;
  try {
    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { progress },
      { new: true }
    ).populate("entrepreneurId", "firstName lastName email");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating goal progress", error: error.message });
  }
};
// const listOrganizations = async (req, res) => {
//   try {
//     const organizations = await Organization.find();
//     const orgUsers = await OrganizationUser.find({
//       userId: req.user.userId,
//       status: "active",
//     }).populate("organizationId", "name isSelected");
//     res.status(200).json(
//       organizations.map((org) => {
//         const orgUser = orgUsers.find(
//           (ou) => ou.organizationId._id.toString() === org._id.toString()
//         );
//         return {
//           id: org._id,
//           name: org.name,
//           isSelected: org.isSelected,
//           role: orgUser ? orgUser.role : null, // Access role directly
//         };
//       })
//     );
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching organizations",
//       error: error.message,
//     });
//   }
// };

const listOrganizations = async (req, res) => {
  try {
    // First get the user's organization memberships
    const orgUsers = await OrganizationUser.find({
      userId: req.user.userId,
      status: "active",
    }).populate("organizationId", "name isSelected");

    // Map the organizations directly from the orgUsers
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
  updateSession,
  listGoals,
  updateGoal,
  updateGoalProgress,
  listOrganizations,
};
