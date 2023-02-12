import createHttpError from "http-errors";
import { verifyAccessToken } from "./tools.js";

export const JwtAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide Bearer Token"));
  } else {
    try {
      const accessToken = req.headers.authorization.replace("Bearer ", "");
      const payload = await verifyAccessToken(accessToken);

      req.author = {
        _id: payload._id,
        role: payload.role
      };
      next();
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Invalid token"));
    }
  }
};
