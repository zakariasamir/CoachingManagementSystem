import pkg from "jsonwebtoken";
import { OrganizationUser } from "../models/organizationUser.model.js";
const { verify } = pkg;
const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  if (!req.cookies?.token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = verify(req.cookies.token, JWT_SECRET);

    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Get organizationId from query params or request body
    const organizationId = req.query.organizationId || null;
    // If no organizationId is provided, get the user's default organization

    if (!organizationId) {
      // const user = await OrganizationUser.findOne({
      //   userId: decoded.id,
      //   status: "active",
      // });
      // return res.status(200).json(user);
      return next();
    }

    // Find user's role in the specific organization
    const orgUser = await OrganizationUser.findOne({
      userId: decoded.id,
      organizationId,
      status: "active",
    });

    if (!orgUser) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this organization",
      });
    }

    // Add both user info and organization context to request
    req.user = {
      userId: decoded.id,
      organizationId,
      role: orgUser.role, // This is the role specific to the organization
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token hello",
    });
  }
};

export default authenticate;
