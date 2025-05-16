// import pkg from "jsonwebtoken";
// import { OrganizationUser } from "../models/organizationUser.model.js";
// const { verify } = pkg;
// const { JWT_SECRET } = process.env;

// const authenticate = async (req, res, next) => {
//   if (!req.cookies?.token) {
//     return res.status(401).json({
//       success: false,
//       message: "Access denied. No token provided.",
//     });
//   }

//   try {
//     const decoded = verify(req.cookies.token, JWT_SECRET);

//     if (decoded.exp * 1000 < Date.now()) {
//       return res.status(401).json({
//         success: false,
//         message: "Token has expired",
//       });
//     }

//     // Find the selected organization for the user
//     // const selectedOrgUser = await OrganizationUser.findOne({
//     //   userId: decoded.id,
//     // }).populate({
//     //   path: "organizationId",
//     //   match: { isSelected: true },
//     // });
//     const orgRoles = await OrganizationUser.find({
//       userId: decoded.id,
//       status: "active",
//     }).populate("organizationId", "name isSelected");

//     // Find the selected organization
//     const selectedOrg = orgRoles.find((or) => or.organizationId.isSelected);


//     if (!selectedOrg || !selectedOrg.organizationId) {
//       return res.status(403).json({
//         success: false,
//         message: "No selected organization found for this user.",
//       });
//     }
//     req.user = {
//       userId: decoded.id,
//       organizationId: selectedOrg.organizationId._id,
//       role: selectedOrg.role,
//     };

//     next();
//   } catch (error) {
//     console.error("Authentication failed:", error.message);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };

// export default authenticate;


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

    // Find the selected organization for the user
    const selectedOrgUser = await OrganizationUser.findOne({
      userId: decoded.id,
      status: "active",
      isSelected: true, // Get the organization that is selected for this user
    }).populate("organizationId", "name"); // Remove isSelected from populate since it's now in OrganizationUser

    if (!selectedOrgUser || !selectedOrgUser.organizationId) {
      return res.status(403).json({
        success: false,
        message: "No selected organization found for this user.",
      });
    }

    // Set user context in request
    req.user = {
      userId: decoded.id,
      organizationId: selectedOrgUser.organizationId._id,
      role: selectedOrgUser.role,
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authenticate;