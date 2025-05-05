import pkg from "jsonwebtoken";
const { verify } = pkg;
const { JWT_SECRET } = process.env;

const authenticate = (req, res, next) => {
  if (!req.cookies) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No cookies available.",
    });
  }
  const token = req.cookies.token;

  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to authenticate token",
    });
  }
};

export default authenticate;
