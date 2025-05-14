import { Session } from "../models/session.model.js";
import { Goal } from "../models/goal.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { SessionOrganization } from "../models/sessionOrganization.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";
import { Organization } from "../models/organization.model.js";

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
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

const listOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organizations",
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

const createOrganization = async (req, res) => {
  const name = req.body.name;
  if (!name) {
    return res.status(400).json({ message: "Organization name is required" });
  }
  try {
    const newOrganization = new Organization({ name });
    await newOrganization.save();
    res.status(201).json({ message: "Organization created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating organization", error });
  }
};

const addUserToOrganization = async (req, res) => {
  const { userId, organizationId, role } = req.body;

  if (!userId || !organizationId || !role) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    // Check if user already exists in the organization
    const existingOrgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
    });

    if (existingOrgUser) {
      return res.status(400).json({
        message: "User is already a member of this organization",
      });
    }

    // Create new organization user
    const orgUser = new OrganizationUser({
      userId,
      organizationId,
      role,
      status: "active",
    });

    await orgUser.save();

    // Populate user details in response
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
      error: error.message,
    });
  }
};

const createSession = async (req, res) => {
  const { title, startTime, endTime, organizationId, coachId, entrepreneurId } =
    req.body;

  if (
    !title ||
    !startTime ||
    !endTime ||
    !organizationId ||
    !coachId ||
    !entrepreneurId
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const session = new Session({ title, startTime, endTime });
    await session.save();

    const sessionOrg = new SessionOrganization({
      sessionId: session._id,
      organizationId,
    });
    await sessionOrg.save();

    // Create participant entries
    const coachParticipant = new SessionParticipant({
      sessionId: session._id,
      userId: coachId,
      role: "coach",
    });
    const entrepreneurParticipant = new SessionParticipant({
      sessionId: session._id,
      userId: entrepreneurId,
      role: "entrepreneur",
    });

    await Promise.all([
      coachParticipant.save(),
      entrepreneurParticipant.save(),
    ]);

    res.status(201).json({ message: "Session created successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Error creating session", error });
  }
};

const createGoal = async (req, res) => {
  const { entrepreneurId, coachId, organizationId, title, description } =
    req.body;

  if (!entrepreneurId || !coachId || !organizationId || !title) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newGoal = new Goal({
      entrepreneurId,
      coachId,
      organizationId,
      title,
      description,
    });
    await newGoal.save();
    res
      .status(201)
      .json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error });
  }
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

const updateUserStatus = async (req, res) => {
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
    res.status(500).json({ message: "Error updating user status", error });
  }
};

export {
  getDashboardStats,
  listOrganizations,
  listSessions,
  listUsers,
  listGoals,
  createOrganization,
  createSession,
  createGoal,
  listPayments,
  generateInvoice,
  createUser,
  updateUser,
  updateUserStatus,
  addUserToOrganization,
};
