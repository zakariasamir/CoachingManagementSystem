import { Request, Response } from "express";
import { User } from "../models/user.model";
import { OrganizationUser } from "../models/organizationUser.model";

const getUsers = async (req: Request, res: Response): Promise<void> => {
  const { organizationId, role } = req.query;

  try {
    let users = [];
    if (organizationId) {
      const orgUsers = await OrganizationUser.find({
        organizationId,
        ...(role && { role }),
      });
      const userIds = orgUsers.map((ou) => ou.userId);
      users = await User.find({ _id: { $in: userIds } }).select("-password");
    } else {
      users = await User.find().select("-password");
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const organizations = await OrganizationUser.find({ userId: id }).populate(
      "organizationId"
    );

    res.status(200).json({
      user,
      organizations: organizations.map((org) => ({
        organization: org.organizationId,
        role: org.role,
        status: org.status,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export { getUsers, updateUser, getUserProfile };
