import { Request, Response } from "express";
import { SessionParticipant } from "../models/sessionParticipant.model";
import { Goal } from "../models/goal.model";
import { Session } from "../models/session.model";
import { SessionOrganization } from "../models/sessionOrganization.model";
import { Organization } from "../models/organization.model";
import { OrganizationUser } from "../models/organizationUser.model";
import {
  AuthenticatedRequest,
  IOrganization,
  SessionWithId,
} from "../types/index";

const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { organizationId } = req.query;
  const { userId } = (req as AuthenticatedRequest).user!;

  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Get entrepreneur's sessions
    const sessionParticipants = await SessionParticipant.find({
      userId,
      role: "entrepreneur",
    });
    const sessionIds = sessionParticipants.map((sp) => sp.sessionId);

    const orgSessions = await SessionOrganization.find({
      organizationId,
      sessionId: { $in: sessionIds },
    }).populate<{ sessionId: SessionWithId }>({
      path: "sessionId",
      model: "Session",
      match: { createdAt: { $gte: startDate } },
      select: "title status startTime endTime createdAt",
    });

    const goals = await Goal.find({
      organizationId,
      sessionId: { $in: sessionIds },
      createdAt: { $gte: startDate },
    });

    // Calculate monthly data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "long" });

      const monthSessions = orgSessions.filter((os) => {
        const sessionDate = new Date(os.sessionId.createdAt);
        return (
          sessionDate.getMonth() === date.getMonth() &&
          sessionDate.getFullYear() === date.getFullYear()
        );
      });

      const monthGoals = goals.filter((g) => {
        const goalDate = new Date(g.createdAt);
        return (
          goalDate.getMonth() === date.getMonth() &&
          goalDate.getFullYear() === date.getFullYear()
        );
      });

      return {
        month,
        sessions: {
          total: monthSessions.length,
          completed: monthSessions.filter(
            (s) => s.sessionId.status === "completed"
          ).length,
          upcoming: monthSessions.filter(
            (s) => s.sessionId.status === "scheduled"
          ).length,
        },
        goals: {
          total: monthGoals.length,
          completed: monthGoals.filter((g) => g.status === "completed").length,
          inProgress: monthGoals.filter((g) => g.status === "in-progress")
            .length,
        },
      };
    }).reverse();

    // Calculate totals
    const totals = {
      sessions: {
        total: orgSessions.length,
        completed: orgSessions.filter((s) => s.sessionId.status === "completed")
          .length,
        upcoming: orgSessions.filter((s) => s.sessionId.status === "scheduled")
          .length,
      },
      goals: {
        total: goals.length,
        completed: goals.filter((g) => g.status === "completed").length,
        inProgress: goals.filter((g) => g.status === "in-progress").length,
      },
    };

    res.status(200).json({
      monthlyData,
      totals,
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
    // First verify the user belongs to the organization
    const organizationUser = await OrganizationUser.findOne({
      userId,
      organizationId,
      status: "active",
    });

    if (!organizationUser) {
      res.status(403).json({
        message:
          "Access denied. Insufficient permissions for this organization.",
      });
      return;
    }

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

const getSessionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  const { organizationId } = req.query;
  const { userId } = req.user!;

  try {
    // First verify the user belongs to the organization
    const organizationUser = await OrganizationUser.findOne({
      userId,
      organizationId,
      status: "active",
    });

    if (!organizationUser) {
      res.status(403).json({
        message:
          "Access denied. Insufficient permissions for this organization. hello",
      });
      return;
    }

    // Verify the session belongs to the organization
    const sessionOrganization = await SessionOrganization.findOne({
      organizationId,
      sessionId,
    });

    if (!sessionOrganization) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Verify the entrepreneur is part of this session
    const entrepreneurParticipant = await SessionParticipant.findOne({
      sessionId,
      userId,
      role: "entrepreneur",
    });

    if (!entrepreneurParticipant) {
      res.status(403).json({ message: "Not authorized to view this session" });
      return;
    }

    // Get all participants for this session
    const participants = await SessionParticipant.find({
      sessionId,
    }).populate("userId", "firstName lastName email");

    // Get the session
    const session = await Session.findById(sessionId);

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Get goals for this session and organization
    const goals = await Goal.find({
      sessionId,
      organizationId,
      entrepreneurId: userId,
    })
      .populate("coachId", "firstName lastName email")
      .lean();

    // Combine session with participants and goals
    const sessionData = {
      session: {
        ...session.toObject(),
        participants,
      },
      goals,
    };

    res.status(200).json(sessionData);
  } catch (error) {
    console.error("Error in getSessionById:", error);
    res.status(500).json({
      message: "Error fetching session details",
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
  getSessionById,
};
