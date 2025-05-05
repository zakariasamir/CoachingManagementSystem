import { User } from "../models/user.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";

const getUsers = async (req, res) => {
  const { organizationId, role } = req.query;

  try {
    let users = [];
    if (organizationId) {
      const orgUsers = await OrganizationUser.find({
        organizationId,
        ...(role && { role })
      });
      const userIds = orgUsers.map(ou => ou.userId);
      users = await User.find({ _id: { $in: userIds } })
        .select('-password');
    } else {
      users = await User.find().select('-password');
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

const getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

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
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

export { getUsers, updateUser, getUserProfile };
