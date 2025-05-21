import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { isCelebrateError } from "celebrate";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle celebrate validation errors
  if (isCelebrateError(err)) {
    const validationErrors: { [key: string]: string } = {};

    // Get validation errors from celebrate/joi
    for (const [segment, joiError] of err.details.entries()) {
      joiError.details.forEach(({ path, message }) => {
        validationErrors[path.join(".")] = message;
      });
    }

    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationErrors,
    });
    return;
  }

  // Handle other types of errors
  console.error(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};
