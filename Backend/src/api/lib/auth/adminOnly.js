import createHttpError from "http-errors";

export const adminMiddleware = (req, res, next) => {
  if (req.user.role === "Admin") {
    next();
  } else {
    createHttpError(403, "Admin only");
  }
};
