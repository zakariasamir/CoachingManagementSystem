import { Request, Response } from "express";
import { SessionParticipant } from "../models/sessionParticipant.model";
import { Goal } from "../models/goal.model";
import { Session } from "../models/session.model";
import { SessionOrganization } from "../models/sessionOrganization.model";
import { Organization } from "../models/organization.model";
import { OrganizationUser } from "../models/organizationUser.model";
import { AuthenticatedRequest, IOrganization } from "../types/index";

const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { organizationId } = req.query;
  const { userId } = (req as AuthenticatedRequest).user!;

  try {
    const entrepreneurSessions = await SessionParticipant.find({
      userId,
      role: "entrepreneur",
    });
    const sessionIds = entrepreneurSessions.map((cs) => cs.sessionId);

    const orgSessions = await SessionOrganization.find({
      organizationId,
      sessionId: { $in: sessionIds },
    });
    const orgSessionIds = orgSessions.map((os) => os.sessionId);

    const totalSessions = await Session.countDocuments({
      _id: { $in: orgSessionIds },
    });

    const entrepreneurGoals = await Goal.find({
      entrepreneurId: userId,
      organizationId,
    });

    const completedGoals = entrepreneurGoals.filter(
      (goal) => goal.status === "completed"
    ).length;

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
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listSessions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.user!;
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
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listGoals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { organizationId } = req.query;
  const { userId } = req.user!;

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
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateGoal = async (req: Request, res: Response): Promise<void> => {
  const { goalId } = req.params;
  const { Progress, status } = req.body;

  try {
    const goal = await Goal.findByIdAndUpdate(
      goalId,
      { Progress, status },
      { new: true }
    ).populate("coachId", "firstName lastName email");

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({
      message: "Error updating goal",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const orgUsers = await OrganizationUser.find({
      userId: req.user!.userId,
      status: "active",
    }).populate("organizationId", "name selected");

    const userOrganizations = orgUsers.map((orgUser) => ({
      id: orgUser.organizationId._id,
      name: (orgUser.organizationId as IOrganization).name,
      selected: orgUser.selected,
      role: orgUser.role,
    }));

    res.status(200).json(userOrganizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error instanceof Error ? error.message : "Unknown error",
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
