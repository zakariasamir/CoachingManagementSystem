import { Request, Response } from "express";
import { Session } from "../models/session.model";
import { Goal } from "../models/goal.model";
import { Payment } from "../models/payment.model";
import { User } from "../models/user.model";
import { SessionParticipant } from "../models/sessionParticipant.model";
import { SessionOrganization } from "../models/sessionOrganization.model";
import { OrganizationUser } from "../models/organizationUser.model";
import { Organization } from "../models/organization.model";
import transporter from "../../config/nodemailer";
import {
  AuthenticatedRequest,
  IOrganization,
  IUser,
  DashboardStats,
  MonthData,
  TotalStats,
  GrowthStats,
  SessionWithId,
  OrgSession,
} from "../types/index";
import { Invoice } from "../models/invoice.model";

// Update the calculateGrowthRate function to handle both simple and nested objects
const calculateGrowthRate = (
  data: MonthData[] | { [key: string]: number }[],
  path: string
): string => {
  if (data.length < 2) return "0";

  const getValue = (
    item: MonthData | { [key: string]: number },
    path: string
  ): number => {
    if (!path.includes(".")) {
      return (item as { [key: string]: number })[path] || 0;
    }

    const keys = path.split(".");
    let value: any = item;

    for (const key of keys) {
      if (value === null || value === undefined) return 0;
      value = value[key];
    }

    return typeof value === "number" ? value : 0;
  };

  const current = getValue(data[data.length - 1], path);
  const previous = getValue(data[data.length - 2], path);

  if (previous === 0) return current > 0 ? "100" : "0";
  return (((current - previous) / previous) * 100).toFixed(1);
};

const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { organizationId } = req.params;
    const { view = "month" } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const orgSessions = await SessionOrganization.find({
      organizationId,
    }).populate<{ sessionId: SessionWithId }>({
      path: "sessionId",
      model: "Session",
      match: { createdAt: { $gte: startDate } },
      select: "title status startTime endTime price createdAt",
    });

    const filteredOrgSessions = orgSessions.filter(
      (os): os is typeof os & { sessionId: NonNullable<typeof os.sessionId> } =>
        os.sessionId != null
    );

    const sessionIds = filteredOrgSessions.map((os) => os.sessionId._id);

    const [participants, goals, payments] = await Promise.all([
      SessionParticipant.find({
        sessionId: { $in: sessionIds },
      }).populate("userId", "firstName lastName email role"),

      Goal.find({
        organizationId,
        createdAt: { $gte: startDate },
      }).populate("sessionId"),

      Payment.find({
        organizationId,
        issuedAt: { $gte: startDate },
      }),
    ]);

    // Create a map to store monthly
    const monthlyRevenue = new Map<string, number>();

    // Calculate revenue for each month
    payments.forEach((payment) => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = paymentDate.toLocaleString("default", { month: "long" });
      const currentAmount = monthlyRevenue.get(monthKey) || 0;
      monthlyRevenue.set(monthKey, currentAmount + (payment.amount || 0));
    });

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "long" });

      const monthSessions = filteredOrgSessions.filter((os) => {
        const sessionDate = new Date(os.sessionId.createdAt);
        return (
          sessionDate.getMonth() === date.getMonth() &&
          sessionDate.getFullYear() === date.getFullYear()
        );
      });

      const monthSessionIds = monthSessions.map((s) =>
        s.sessionId._id.toString()
      );

      const monthParticipants = participants.filter((p) =>
        monthSessionIds.includes(p.sessionId.toString())
      );

      const monthGoals = goals.filter((g) => {
        const goalDate = new Date(g.createdAt);
        return (
          goalDate.getMonth() === date.getMonth() &&
          goalDate.getFullYear() === date.getFullYear()
        );
      });

      const uniqueUsers = new Set(
        monthParticipants.map((p) => p.userId._id.toString())
      );

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
        participants: {
          total: uniqueUsers.size,
          coaches: monthParticipants.filter((p) => p.role === "coach").length,
          entrepreneurs: monthParticipants.filter(
            (p) => p.role === "entrepreneur"
          ).length,
        },
      };
    }).reverse();

    const totalRevenue = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    const totals: TotalStats = {
      sessions: {
        total: filteredOrgSessions.length,
        completed: filteredOrgSessions.filter(
          (s) => s.sessionId.status === "completed"
        ).length,
        upcoming: filteredOrgSessions.filter(
          (s) => s.sessionId.status === "scheduled"
        ).length,
      },
      goals: {
        total: goals.length,
        completed: goals.filter((g) => g.status === "completed").length,
        inProgress: goals.filter((g) => g.status === "in-progress").length,
      },
      participants: {
        total: new Set(participants.map((p) => p.userId._id.toString())).size,
        coaches: new Set(
          participants
            .filter((p) => p.role === "coach")
            .map((p) => p.userId._id.toString())
        ).size,
        entrepreneurs: new Set(
          participants
            .filter((p) => p.role === "entrepreneur")
            .map((p) => p.userId._id.toString())
        ).size,
      },
      revenue: totalRevenue,
    };

    // Update the growth calculation in getDashboardStats
    const growth: GrowthStats = {
      sessions: calculateGrowthRate(monthlyData, "sessions.total"),
      goals: calculateGrowthRate(monthlyData, "goals.total"),
      participants: calculateGrowthRate(monthlyData, "participants.total"),
    };

    const response: DashboardStats = {
      monthlyData,
      totals,
      growth,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      message: "Error fetching dashboard stats",
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
      userId: req.user?.userId,
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

const listAllOrganizations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listSessions = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.query;

  try {
    const orgSessions = await SessionOrganization.find({ organizationId });
    const sessionIds = orgSessions.map((os) => os.sessionId);

    const sessions = await Session.find({ _id: { $in: sessionIds } });
    const participants = await SessionParticipant.find({
      sessionId: { $in: sessionIds },
    }).populate("userId", "firstName lastName email");

    const sessionsWithParticipants = sessions.map((session) => ({
      ...session.toObject(),
      participants: participants.filter(
        (p) => p.sessionId.toString() === session._id.toString()
      ),
    }));

    res.status(200).json(sessionsWithParticipants);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sessions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { organizationId, role } = req.query;

  try {
    const orgUsers = await OrganizationUser.find({
      organizationId,
      ...(role && { role }),
    }).populate("userId", "-password");
    res.status(200).json(
      orgUsers.map((ou) => ({
        ...(ou.userId as IUser).toObject(),
        role: ou.role,
        status: ou.status,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listGoals = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.query;

  try {
    const goals = await Goal.find({ organizationId })
      .populate("entrepreneurId", "firstName lastName email")
      .populate("coachId", "firstName lastName email");
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching goals",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  const name = req.body.name;
  if (!name) {
    res.status(400).json({ message: "Organization name is required" });
    return;
  }
  try {
    const newOrganization = new Organization({ name });
    await newOrganization.save();
    res.status(201).json({ message: "Organization created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error creating organization",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const addUserToOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, organizationId, role } = req.body;

  if (!userId || !organizationId || !role) {
    res.status(400).json({ message: "Required fields are missing" });
    return;
  }

  try {
    const existingOrgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
    });

    if (existingOrgUser) {
      res.status(400).json({
        message: "User is already a member of this organization",
      });
      return;
    }

    const orgUser = new OrganizationUser({
      userId,
      organizationId,
      role,
      status: "active",
    });

    await orgUser.save();

    const populatedOrgUser = await OrganizationUser.findById(orgUser._id)
      .populate("userId", "firstName lastName email")
      .populate("organizationId", "name");

    res.status(201).json({
      message: "User added to organization successfully",
      organizationUser: populatedOrgUser,
    });
  } catch (error) {
    console.error("Error adding user to organization:", error);
    res.status(500).json({
      message: "Error adding user to organization",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const createSession = async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    startTime,
    endTime,
    organizationId,
    coachId,
    entrepreneurIds,
    price,
  } = req.body;

  if (
    !title ||
    !startTime ||
    !endTime ||
    !organizationId ||
    !coachId ||
    !entrepreneurIds ||
    !Array.isArray(entrepreneurIds) ||
    entrepreneurIds.length === 0 ||
    !price
  ) {
    res.status(400).json({ message: "Required fields are missing or invalid" });
    return;
  }

  try {
    const session = new Session({ title, startTime, endTime, price });
    await session.save();

    const sessionOrg = new SessionOrganization({
      sessionId: session._id,
      organizationId,
    });
    await sessionOrg.save();

    const coachParticipant = new SessionParticipant({
      sessionId: session._id,
      userId: coachId,
      role: "coach",
    });

    const entrepreneurParticipants = entrepreneurIds.map(
      (entrepreneurId) =>
        new SessionParticipant({
          sessionId: session._id,
          userId: entrepreneurId,
          role: "entrepreneur",
        })
    );

    await Promise.all([
      coachParticipant.save(),
      ...entrepreneurParticipants.map((p) => p.save()),
    ]);

    const coach = await User.findById(coachId);
    const entrepreneurs = await User.find({ _id: { $in: entrepreneurIds } });
    const manager = await User.findById(
      (req as AuthenticatedRequest).user?.userId
    );
    const organization = await Organization.findById(organizationId);

    const entrepreneurNames = entrepreneurs
      .map((e) => `${e.firstName} ${e.lastName}`)
      .join(", ");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: coach?.email,
      subject: `Invitation to Lead a Session on ${title}`,
      text: `Dear Coach ${coach?.firstName} ${coach?.lastName},

      You have been invited to lead a session on ${title} by ${manager?.firstName} ${manager?.lastName} from ${organization?.name}.
      
      The session will be with entrepreneurs: ${entrepreneurNames}
      
      The session will be held on ${startTime} and will last until ${endTime}, and the price is ${price}.`,
      html: `<p>Dear Coach ${coach?.firstName} ${coach?.lastName},<br><br>
      You have been invited to lead a session on ${title} by ${manager?.firstName} ${manager?.lastName} from ${organization?.name}.<br><br>
      The session will be with entrepreneurs: ${entrepreneurNames}<br><br>
      The session will be held on ${startTime} and will last until ${endTime}, and the price is ${price}.<br><br>
      <a href="${process.env.FRONTEND_URL}/coach/sessionRequest/${session._id}">Click here to accept the invitation</a></p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(201).json({
        message: "Session created successfully",
        session,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      res.status(201).json({
        message: "Session created successfully but email failed to send",
        session,
        emailError:
          emailError instanceof Error ? emailError.message : "Unknown error",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error creating session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const listPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  const { paymentId } = req.body;
  // const invoice = await InvoiceService.generate(paymentId);
  // res.json(invoice);
};

const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const user = await OrganizationUser.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error updating user status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getSessionById = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
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
        // status: p.status,
        joinedAt: p.joinedAt,
      }));
    const goals = await Goal.find({
      sessionId,
    })
      .populate("coachId", "firstName lastName email")
      .lean();

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

const listInvoices = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.query;
  try {
    const invoices = await Invoice.find({ organizationId })
      .populate({
        path: "paymentId",
        populate: {
          path: "coachId",
          select: "firstName lastName email",
        },
      })
      .populate({
        path: "paymentId",
        populate: {
          path: "sessionIds",
          select: "title startTime endTime",
        },
      })
      .sort({ issuedAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const processInvoice = async (req: Request, res: Response): Promise<void> => {
  const { invoiceId } = req.params;
  const { status } = req.body;

  if (!["viewed", "paid"].includes(status)) {
    res.status(400).json({ message: "Invalid invoice status" });
    return;
  }

  try {
    const invoice = await Invoice.findById(invoiceId).populate({
      path: "paymentId",
      populate: [
        {
          path: "coachId",
          select: "firstName lastName email",
        },
        {
          path: "sessionIds",
          select: "title",
        },
      ],
    });

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    invoice.status = status;
    await invoice.save();

    if (status === "paid") {
      const payment = await Payment.findById(invoice.paymentId);
      if (payment) {
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        const coach = payment.coachId as any;
        const sessions = payment.sessionIds as any[];
        const sessionTitles = sessions.map((s) => s.title).join(", ");

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: coach.email,
          subject: `Payment Processed for Invoice #${invoice.invoiceNumber}`,
          text: `Dear ${coach.firstName} ${coach.lastName},

          Your payment for invoice #${invoice.invoiceNumber} has been processed.
          
          Details:
          - Amount: $${invoice.amount}
          - Sessions: ${sessionTitles}
          - Payment Date: ${new Date().toLocaleDateString()}
          
          Thank you for your services.`,
          html: `<p>Dear ${coach.firstName} ${coach.lastName},</p>
          <p>Your payment for invoice #${
            invoice.invoiceNumber
          } has been processed.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li>Amount: $${invoice.amount}</li>
            <li>Sessions: ${sessionTitles}</li>
            <li>Payment Date: ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Thank you for your services.</p>`,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error(
            "Error sending payment confirmation email:",
            emailError
          );
        }
      }
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({
      message: "Error processing invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export {
  getDashboardStats,
  listOrganizations,
  listAllOrganizations,
  listSessions,
  listUsers,
  listGoals,
  createOrganization,
  createSession,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
  updateUserStatus,
  addUserToOrganization,
  getSessionById,
  listInvoices,
  processInvoice,
};
