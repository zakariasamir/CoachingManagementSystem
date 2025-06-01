import { Request, Response } from "express";
import { SessionParticipant } from "../models/sessionParticipant.model";
import { SessionOrganization } from "../models/sessionOrganization.model";
import { OrganizationUser } from "../models/organizationUser.model";
import { Invoice } from "../models/invoice.model";
import { Payment } from "../models/payment.model";
import { Goal } from "../models/goal.model";
import { Session } from "../models/session.model";
import { User } from "../models/user.model";
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

    // Get coach's sessions
    const sessionParticipants = await SessionParticipant.find({
      userId,
      role: "coach",
    });
    const sessionIds = sessionParticipants.map((sp) => sp.sessionId);

    const orgSessions = await SessionOrganization.find({
      organizationId,
      sessionId: { $in: sessionIds },
    }).populate<{ sessionId: SessionWithId }>({
      path: "sessionId",
      model: "Session",
      match: { createdAt: { $gte: startDate } },
      select: "title status startTime endTime price createdAt",
    });

    const goals = await Goal.find({
      coachId: userId,
      organizationId,
      createdAt: { $gte: startDate },
    });

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
    console.error("Error in getDashboardStats:", error);
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
      role: "coach",
    });

    const sessionIds = sessionParticipants.map((sp) => sp.sessionId);

    const sessions = await Session.find({
      _id: { $in: sessionIds },
      status: { $in: ["scheduled", "completed", "cancelled"] },
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

const updateSession = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { status } = req.body;
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    console.error("Error in updateSession:", error);
    res.status(500).json({
      message: "Error updating session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listGoals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { organizationId } = req.query;
  try {
    const goals = await Goal.find({ coachId: req.user!.userId, organizationId })
      .populate("entrepreneurId", "firstName lastName email")
      .populate("organizationId", "name");
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching goals",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateGoal = async (req: Request, res: Response): Promise<void> => {
  const { goalId } = req.params;
  const { progress, update } = req.body;

  try {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const updateData: any = {
      progress: progress,
      status:
        progress === 100
          ? "completed"
          : progress > 0
          ? "in-progress"
          : "not-started",
    };

    if (update?.content) {
      updateData.$push = {
        updates: {
          content: update.content,
          timestamp: new Date(),
          updatedBy: (req as AuthenticatedRequest).user?.userId,
        },
      };
    }

    const updatedGoal = await Goal.findByIdAndUpdate(goalId, updateData, {
      new: true,
    });

    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
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

const listRequestedSessions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.user!;
  const { organizationId } = req.query;
  try {
    const sessionOrganization = await SessionOrganization.find({
      organizationId,
    });
    const sessionOrganizationIds = sessionOrganization.map(
      (so) => so.sessionId
    );
    // Find all sessions where the coach is the current user
    const coachParticipants = await SessionParticipant.find({
      userId,
      role: "coach",
      sessionId: { $in: sessionOrganizationIds },
    });

    const sessionIds = coachParticipants.map((sp) => sp.sessionId);

    // Find all entrepreneur participants for these sessions
    const entrepreneurParticipants = await SessionParticipant.find({
      sessionId: { $in: sessionIds },
      role: "entrepreneur",
    });

    const entrepreneursBySession = entrepreneurParticipants.reduce(
      (map, ep) => {
        const sessionId = ep.sessionId.toString();
        if (!map.has(sessionId)) {
          map.set(sessionId, []);
        }
        map.get(sessionId)?.push(ep);
        return map;
      },
      new Map<string, any[]>()
    );

    const userIds = [
      ...new Set([
        ...coachParticipants.map((cp) => cp.userId),
        ...entrepreneurParticipants.map((ep) => ep.userId),
      ]),
    ];

    // Fetch all users in one query, only selecting needed fields
    const users = await User.find({ _id: { $in: userIds } }).select(
      "firstName lastName email"
    );
    const userMap = users.reduce((map, user) => {
      map.set(user._id.toString(), user);
      return map;
    }, new Map());

    // Fetch all relevant sessions
    const sessions = await Session.find({
      _id: { $in: sessionIds },
      isAccepted: false,
    });

    // Combine all the data
    const sessionsWithParticipants = sessions.map((session) => {
      const sessionId = session._id.toString();
      const coachParticipant = coachParticipants.find(
        (cp) => cp.sessionId.toString() === sessionId
      );
      const sessionEntrepreneurs = entrepreneursBySession.get(sessionId) || [];

      return {
        ...session.toObject(),
        coach: coachParticipant
          ? userMap.get(coachParticipant.userId.toString())
          : null,
        entrepreneurs: sessionEntrepreneurs.map((ep) =>
          userMap.get(ep.userId.toString())
        ),
      };
    });

    res.status(200).json(sessionsWithParticipants);
  } catch (error) {
    console.error("Error in listRequestedSessions:", error);
    res.status(500).json({
      message: "Error fetching requested sessions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateSessionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  const { isAccepted } = req.body;
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { isAccepted, status: isAccepted ? "scheduled" : "declined" },
      { new: true }
    );
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: "Error updating session status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getRequestedSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.user!;
  const { organizationId } = req.query;
  const { sessionId } = req.params;
  try {
    // Verify the session belongs to the organization
    const sessionOrganization = await SessionOrganization.findOne({
      organizationId,
      sessionId,
    });

    if (!sessionOrganization) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Verify the coach is assigned to this session
    const coachParticipant = await SessionParticipant.findOne({
      sessionId,
      userId,
      role: "coach",
    });

    if (!coachParticipant) {
      res.status(403).json({ message: "Not authorized to view this session" });
      return;
    }

    // Find all entrepreneur participants for this session
    const entrepreneurParticipants = await SessionParticipant.find({
      sessionId,
      role: "entrepreneur",
    });

    const userIds = [
      ...new Set([
        coachParticipant.userId.toString(),
        ...entrepreneurParticipants.map((ep) => ep.userId.toString()),
      ]),
    ];

    // Fetch all users in one query, only selecting needed fields
    const users = await User.find({ _id: { $in: userIds } }).select(
      "firstName lastName email"
    );
    const userMap = users.reduce((map, user) => {
      map.set(user._id.toString(), user);
      return map;
    }, new Map());

    // Fetch the session
    const session = await Session.findOne({
      _id: sessionId,
    });

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    // Combine all the data
    const sessionWithParticipants = {
      ...session.toObject(),
      coach: userMap.get(coachParticipant.userId.toString()),
      entrepreneurs: entrepreneurParticipants.map((ep) =>
        userMap.get(ep.userId.toString())
      ),
    };

    res.status(200).json(sessionWithParticipants);
  } catch (error) {
    console.error("Error in getRequestedSession:", error);
    res.status(500).json({
      message: "Error fetching session details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getSessionById = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { organizationId } = req.query;

  try {
    const session = await Session.findById(sessionId).lean();
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    const participants = await SessionParticipant.find({
      sessionId: sessionId,
    })
      .populate("userId", "firstName lastName email profileImage")
      .lean();

    const coach = participants.find((p) => p.role === "coach")?.userId;
    const entrepreneurs = participants
      .filter((p) => p.role === "entrepreneur")
      .map((p) => ({
        ...p.userId,
        joinedAt: p.joinedAt,
      }));

    // Get goals for this session and organization
    const goals = await Goal.find({
      sessionId,
      organizationId,
    })
      // .populate("entrepreneurId", "firstName lastName email")
      .populate("coachId", "firstName lastName email")
      .lean();

    // Combine session with separated participants and goals
    const sessionData = {
      session: {
        ...session,
        coach,
        entrepreneurs,
      },
      goals,
    };

    res.status(200).json(sessionData);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createGoal = async (req: Request, res: Response): Promise<void> => {
  const { coachId, organizationId, title, description, sessionId } = req.body;

  if (!coachId || !organizationId || !title || !sessionId) {
    res.status(400).json({ message: "Required fields are missing" });
    return;
  }

  try {
    const newGoal = new Goal({
      coachId,
      organizationId,
      title,
      description,
      sessionId,
    });
    await newGoal.save();
    res
      .status(201)
      .json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({
      message: "Error creating goal",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listInvoices = async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as AuthenticatedRequest).user!;
  const { status, startDate, endDate } = req.query;

  try {
    const query: any = {
      coachId: userId,
    };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const invoices = await Invoice.find(query)
      .populate("sessionId", "title startTime endTime")
      .populate("organizationId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Invoices retrieved successfully",
      data: invoices,
    });
  } catch (error) {
    console.error("Error in listInvoices:", error);
    res.status(500).json({
      message: "Error retrieving invoices",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const processInvoice = async (req: Request, res: Response): Promise<void> => {
  const { invoiceId } = req.params;
  const { userId } = (req as AuthenticatedRequest).user!;

  try {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      issuedTo: userId,
    });

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    if (invoice.status !== "sent") {
      res.status(400).json({ message: "Invoice has already been processed" });
      return;
    }

    // Create payment record first
    const payment = await Payment.create({
      coachId: userId,
      organizationId: invoice.organizationId,
      // sessionIds: [invoice.sessionId],
      amount: invoice.amount,
      status: "paid",
      issuedAt: new Date(),
      paidAt: new Date(),
    });

    // Update invoice status
    invoice.status = "paid";
    invoice.paymentId = payment._id;
    await invoice.save();

    res.status(200).json({
      message: "Invoice processed successfully",
      data: {
        invoice,
        payment,
      },
    });
  } catch (error) {
    console.error("Error in processInvoice:", error);
    res.status(500).json({
      message: "Error processing invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getDashboardStats,
  listSessions,
  updateSession,
  listGoals,
  updateGoal,
  listOrganizations,
  listRequestedSessions,
  updateSessionStatus,
  getRequestedSession,
  getSessionById,
  createGoal,
  listInvoices,
  processInvoice,
};
