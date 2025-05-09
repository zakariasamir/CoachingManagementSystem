import { Session } from "../models/session.model.js";
import { Goal } from "../models/goal.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { SessionOrganization } from "../models/sessionOrganization.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";
// import InvoiceService from "../services/invoiceService";

const getDashboardStats = async (req, res) => {
  const { organizationId } = req.query;

  try {
    const orgSessions = await SessionOrganization.find({ organizationId });
    const sessionIds = orgSessions.map((os) => os.sessionId);

    const totalSessions = await Session.countDocuments({
      _id: { $in: sessionIds },
    });
    const totalGoals = await Goal.countDocuments({ organizationId });
    const payments = await Payment.countDocuments({ organizationId });

    res.status(200).json({
      totalSessions,
      totalGoals,
      payments,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching dashboard stats",
        error: error.message,
      });
  }
};

const listSessions = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Error fetching sessions", error: error.message });
  }
};

const listUsers = async (req, res) => {
  const { organizationId, role } = req.query;

  try {
    const orgUsers = await OrganizationUser.find({
      organizationId,
      ...(role && { role }),
    }).populate("userId", "-password");

    res.status(200).json(
      orgUsers.map((ou) => ({
        ...ou.userId.toObject(),
        role: ou.role,
        status: ou.status,
      }))
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const listGoals = async (req, res) => {
  const { organizationId } = req.query;

  try {
    const goals = await Goal.find({ organizationId })
      .populate("entrepreneurId", "firstName lastName email")
      .populate("coachId", "firstName lastName email");
    res.status(200).json(goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching goals", error: error.message });
  }
};

const createSession = async (req, res) => {
  const session = new Session(req.body);
  await session.save();
  res.status(201).json(session);
};

const createGoal = async (req, res) => {
  const goal = new Goal(req.body);
  await goal.save();
  res.status(201).json(goal);
};

const listPayments = async (req, res) => {
  const payments = await Payment.find();
  res.json(payments);
};

const generateInvoice = async (req, res) => {
  const { paymentId } = req.body;
  // const invoice = await InvoiceService.generate(paymentId);
  // res.json(invoice);
};

const createUser = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, req.body, { new: true });
  res.json(user);
};

export {
  getDashboardStats,
  listSessions,
  listUsers,
  listGoals,
  createSession,
  createGoal,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
};
