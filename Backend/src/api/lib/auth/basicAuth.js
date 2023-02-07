import createHttpError from "http-errors";
import atob from "atob";
import AuthorModel from "../../authors/model.js";

export const authMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Credentials missing in Authorization header"));
  } else {
    const encodedCreds = req.headers.authorization.split(" ")[1];
    const creds = atob(encodedCreds);
    const [email, password] = creds.split(":");
    const author = await AuthorModel.checkCredentials(email, password);
    if (author) {
      req.author = author;
    } else {
      next(createHttpError(401, "Incorrect Credentials"));
    }
  }
};
