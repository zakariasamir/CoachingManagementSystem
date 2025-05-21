import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { OrganizationUser } from "../models/organizationUser.model";
import {
  AuthenticatedRequest,
  IOrganization,
  JWTPayload,
} from "../types/index";

const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.cookies?.token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = verify(
      req.cookies.token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Find the selected organization for the user
    const selectedOrgUser = await OrganizationUser.findOne({
      userId: decoded.id,
      status: "active",
      selected: true,
    }).populate("organizationId", "name");

    if (!selectedOrgUser || !selectedOrgUser.organizationId) {
      return res.status(403).json({
        success: false,
        message: "No selected organization found for this user.",
      });
    }

    // Set user context in request
    req.user = {
      userId: decoded.id,
      organizationId: (
        selectedOrgUser.organizationId as IOrganization
      )._id.toString(),
      role: selectedOrgUser.role,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid token",
    });
  }
};

export default authenticate;
