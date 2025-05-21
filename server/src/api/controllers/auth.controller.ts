import { Request, Response } from "express";
import { User } from "../models/user.model";
import { OrganizationUser } from "../models/organizationUser.model";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import {
  AuthenticatedRequest,
  JWTPayload,
  IOrganization,
  IOrganizationUser,
  IUser,
} from "../types/index";

interface LoginResponse {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    organizations: {
      id: string;
      name: string;
      selected: boolean;
      role: string;
    } | null;
  };
}

const register = async (req: Request, res: Response): Promise<void> => {
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
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
    });
    await newUser.save();

    const organizationUser = new OrganizationUser({
      userId: newUser._id,
      organizationId,
      role,
      status: "active",
    });
    await organizationUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    let orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate<{ organizationId: IOrganization }>("organizationId", "name");

    let selectedOrg = orgRoles.find((or) => or.selected);

    if (!selectedOrg && orgRoles.length > 0) {
      selectedOrg = orgRoles[0];

      await OrganizationUser.updateMany(
        { userId: user._id },
        { selected: false }
      );
      await OrganizationUser.updateOne(
        { userId: user._id, organizationId: selectedOrg.organizationId._id },
        { selected: true }
      );

      orgRoles = await OrganizationUser.find({
        userId: user._id,
        status: "active",
      }).populate<{ organizationId: IOrganization }>("organizationId", "name");
      selectedOrg = orgRoles.find((or) => or.selected);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
      } as JWTPayload,
      process.env.JWT_SECRET as jwt.Secret,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      } as jwt.SignOptions
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
    });

    const response: LoginResponse = {
      user: {
        userId: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizations: selectedOrg
          ? {
              id: selectedOrg.organizationId._id.toString(),
              name: selectedOrg.organizationId.name,
              selected: selectedOrg.selected,
              role: selectedOrg.role,
            }
          : null,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error during login",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const logout = (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

const checkAuthStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate<{ organizationId: IOrganization }>("organizationId", "name");

    const selectedOrg = orgRoles.find((or) => or.selected);

    const response: LoginResponse = {
      user: {
        userId: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizations: selectedOrg
          ? {
              id: selectedOrg.organizationId._id.toString(),
              name: selectedOrg.organizationId.name,
              selected: selectedOrg.selected,
              role: selectedOrg.role,
            }
          : null,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const switchOrganization = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { organizationId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const orgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
      status: "active",
    }).populate<{ organizationId: IOrganization }>("organizationId", "name");

    if (!orgUser) {
      res.status(403).json({
        message: "User does not belong to this organization",
      });
      return;
    }

    await OrganizationUser.updateMany({ userId }, { selected: false });

    await OrganizationUser.updateOne(
      { userId, organizationId },
      { selected: true }
    );

    const updatedOrgUser = await OrganizationUser.findOne({
      userId,
      organizationId,
    }).populate<{ organizationId: IOrganization }>("organizationId", "name");

    if (!updatedOrgUser) {
      throw new Error("Failed to update organization user");
    }

    res.status(200).json({
      message: "Organization switched successfully",
      organization: {
        id: updatedOrgUser.organizationId._id.toString(),
        name: updatedOrgUser.organizationId.name,
        selected: updatedOrgUser.selected,
        role: updatedOrgUser.role,
      },
    });
  } catch (error) {
    console.error("Error switching organization:", error);
    res.status(500).json({
      message: "Error switching organization",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export { register, login, logout, checkAuthStatus, switchOrganization };
