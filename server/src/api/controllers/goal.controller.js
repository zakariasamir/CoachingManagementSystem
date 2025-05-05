import { Goal } from "../models/goal.model.js";

const createGoal = async (req, res) => {
  const { entrepreneurId, coachId, organizationId, title, description } = req.body;
  
  if (!entrepreneurId || !coachId || !organizationId || !title) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newGoal = new Goal({
      entrepreneurId,
      coachId,
      organizationId,
      title,
      description
    });
    await newGoal.save();
    res.status(201).json({ message: "Goal created successfully", goal: newGoal });
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error });
  }
};

const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, description, Progress, status } = req.body;

  try {
    const goal = await Goal.findByIdAndUpdate(
      id,
      { title, description, Progress, status },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error updating goal", error });
  }
};

const addGoalUpdate = async (req, res) => {
  const { id } = req.params;
  const { updatedBy, content } = req.body;

  try {
    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.updates.push({ updatedBy, content });
    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error adding update", error });
  }
};

const getGoals = async (req, res) => {
  const { organizationId, entrepreneurId, coachId } = req.query;
  const query = {};
  
  if (organizationId) query.organizationId = organizationId;
  if (entrepreneurId) query.entrepreneurId = entrepreneurId;
  if (coachId) query.coachId = coachId;

  try {
    const goals = await Goal.find(query)
      .populate('entrepreneurId', 'firstName lastName')
      .populate('coachId', 'firstName lastName');
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals", error });
  }
};

export { createGoal, updateGoal, addGoalUpdate, getGoals };