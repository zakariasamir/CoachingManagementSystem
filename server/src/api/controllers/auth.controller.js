import { User } from "../models/user.model.js";
import { OrganizationUser } from "../models/organizationUser.model.js";
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
    const orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate("organizationId", "name");

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        organizations: orgRoles.map((or) => ({
          id: or.organizationId._id,
          name: or.organizationId.name,
          // role: or.role,
        })),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizations: orgRoles.map((or) => ({
          id: or.organizationId._id,
          name: or.organizationId.name,
          role: or.role,
        })),
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
    const user = await User.findById(req.user.id).select("-password");
    const orgRoles = await OrganizationUser.find({
      userId: user._id,
      status: "active",
    }).populate("organizationId", "name");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizations: orgRoles.map((or) => ({
          id: or.organizationId._id,
          name: or.organizationId.name,
          role: or.role,
        })),
      },
    });
  } catch (error) {
    res.status(401).json({ error: "Not authenticated" });
  }
};

export { register, login, logout, checkAuthStatus };
