import { Session } from "../models/session.model.js";
import { SessionParticipant } from "../models/sessionParticipant.model.js";
import { SessionOrganization } from "../models/sessionOrganization.model.js";

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

const updateSessionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const session = await Session.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session", error });
  }
};

// const getSessions = async (req, res) => {
//   const { organizationId, userId, role } = req.query;

//   try {
//     let sessions = [];
//     if (userId) {
//       const participations = await SessionParticipant.find({
//         userId,
//         ...(role && { role })
//       });
//       const sessionIds = participations.map(p => p.sessionId);
//       sessions = await Session.find({ _id: { $in: sessionIds } });
//     } else if (organizationId) {
//       const orgSessions = await SessionOrganization.find({ organizationId });
//       const sessionIds = orgSessions.map(os => os.sessionId);
//       sessions = await Session.find({ _id: { $in: sessionIds } });
//     }

//     res.status(200).json(sessions);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching sessions", error });
//   }
// };

// get all sessions by organizationId and send with it all the participants
const getSessions = async (req, res) => {
  const { organizationId } = req.query;

  try {
    // Get sessions for the organization
    const orgSessions = await SessionOrganization.find({ organizationId });
    const sessionIds = orgSessions.map((os) => os.sessionId);
    const sessions = await Session.find({ _id: { $in: sessionIds } });

    // Get participants with populated user data
    const participants = await SessionParticipant.find({
      sessionId: { $in: sessionIds },
    }).populate("userId", "firstName lastName email");

    // Combine sessions with their participants, filtering out participants with missing users
    const sessionsWithParticipants = sessions.map((session) => ({
      ...session.toObject(),
      participants: participants
        .filter((p) => p.sessionId.toString() === session._id.toString())
        .filter((p) => p.userId)
        .map((participant) => ({
          _id: participant._id,
          sessionId: participant.sessionId,
          userId: participant.userId._id,
          role: participant.role,
          joinedAt: participant.joinedAt,
          user: {
            firstName: participant.userId.firstName,
            lastName: participant.userId.lastName,
            email: participant.userId.email,
          },
        })),
    }));

    res.status(200).json(sessionsWithParticipants);
  } catch (error) {
    console.error("Error in getSessions:", error);
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const participants = await SessionParticipant.find({ sessionId: id });
    const organizations = await SessionOrganization.find({ sessionId: id });

    res.status(200).json({
      session,
      participants,
      organizations,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching session", error });
  }
};

export { createSession, updateSessionStatus, getSessions, getSessionById };
