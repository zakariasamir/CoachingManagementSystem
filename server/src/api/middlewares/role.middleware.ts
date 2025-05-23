import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/index";

const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied. Role information missing.",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Access denied. Insufficient permissions for this organization.",
      });
    }
    next();
  };
};

export default authorize;
