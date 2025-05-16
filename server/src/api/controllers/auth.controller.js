import { User } from "../models/user.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";
import { Organization } from "../models/organization.model.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { firstName, lastName, email, role, password, organizationId } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !role ||
    !password ||
    !organizationId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hash(password, 10);

    // Create user without organizationId
    const newUser = new User({
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
    });
    await newUser.save();

    // Create organization association
    const organizationUser = new OrganizationUser({
      userId: newUser._id,
      organizationId,
      role,
      status: "active",
    });
    await organizationUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Get user's organization roles
    let orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate("organizationId", "name");

    // Check if user has a selected organization
    let selectedOrg = orgRoles.find((or) => or.isSelected);

    // If no selected organization, this is the user's first login
    if (!selectedOrg && orgRoles.length > 0) {
      // Select the first organization as default
      selectedOrg = orgRoles[0];

      // Update the organization to isSelected: true
      await OrganizationUser.updateMany(
        { userId: user._id },
        { isSelected: false }
      );
      await OrganizationUser.updateOne(
        { userId: user._id, organizationId: selectedOrg.organizationId._id },
        { isSelected: true }
      );

      // Refresh orgRoles after update
      orgRoles = await OrganizationUser.find({
        userId: user._id,
        status: "active",
      }).populate("organizationId", "name");
      selectedOrg = orgRoles.find((or) => or.isSelected);
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        // organizationId: selectedOrg ? selectedOrg.organizationId._id : null,
        // role: selectedOrg ? selectedOrg.role : null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizations: selectedOrg
          ? {
              id: selectedOrg.organizationId._id,
              name: selectedOrg.organizationId.name,
              isSelected: selectedOrg.isSelected,
              role: selectedOrg.role,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

const checkAuthStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get user's organization roles
    // In the checkAuthStatus function, update the orgRoles query:
    const orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate("organizationId", "name");

    // Find the selected organization
    const selectedOrg = orgRoles.find((or) => or.isSelected);
    console.log("Selected Org:", selectedOrg);

    res.status(200).json({
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizations: selectedOrg
          ? {
              id: selectedOrg.organizationId._id,
              name: selectedOrg.organizationId.name,
              isSelected: selectedOrg.isSelected,
              role: selectedOrg.role,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const switchOrganization = async (req, res) => {
  const { organizationId } = req.body;
  const { userId } = req.user;

  try {
    // Verify user belongs to organization
    const orgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
      status: "active",
    }).populate("organizationId", "name");

    if (!orgUser) {
      return res.status(403).json({
        message: "User does not belong to this organization",
      });
    }

    // Update isSelected in OrganizationUser model
    await OrganizationUser.updateMany(
      { userId }, // Find all organizations for this user
      { isSelected: false } // Set all to false first
    );

    await OrganizationUser.updateOne(
      { userId, organizationId },
      { isSelected: true } // Set the selected one to true
    );

    // Get updated orgUser
    const updatedOrgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
    }).populate("organizationId", "name");

    res.status(200).json({
      message: "Organization switched successfully",
      organization: {
        id: updatedOrgUser.organizationId._id,
        name: updatedOrgUser.organizationId.name,
        isSelected: updatedOrgUser.isSelected,
        role: updatedOrgUser.role,
      },
    });
  } catch (error) {
    console.error("Error switching organization:", error);
    res.status(500).json({
      message: "Error switching organization",
      error: error.message,
    });
  }
};

export { register, login, logout, checkAuthStatus, switchOrganization };
