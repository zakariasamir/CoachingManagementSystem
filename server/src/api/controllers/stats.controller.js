import { Payment } from "../models/payment.model.js";
import { Session } from "../models/session.model.js";
import { Goal } from "../models/goal.model.js";

const getStats = async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const totalGoals = await Goal.countDocuments();
    const Payments = await Payment.countDocuments();

    res.status(200).json({
      totalSessions,
      totalGoals,
      Payments,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};

export { getStats };
