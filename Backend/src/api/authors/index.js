import express from "express";
import createHttpError from "http-errors";
import authorModel from "./model.js";
import BlogModel from "../blogs/model.js";
import q2m from "query-to-mongo";

import { authMiddleware } from "../lib/auth/basicAuth.js";
import { JwtAuthMiddleware } from "../lib/auth/jwtAuth.js";
import { adminMiddleware } from "../lib/auth/adminOnly.js";
import { createAccessToken } from "../lib/auth/tools.js";
import passport from "passport";

const authorRouter = express.Router();

// ---------- endpoints

authorRouter.get(
  "/",
  JwtAuthMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query);
      const total = await authorModel.countDocuments(mongoQuery.criteria);
      const authors = await authorModel
        .find(mongoQuery.criteria, mongoQuery.options.fields)
        .limit(mongoQuery.options.limit)
        .skip(mongoQuery.options.skip)
        .sort(mongoQuery.options.sort);
      res.send({
        links: mongoQuery.links("http://localhost:3001/authors", total),
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        authors
      });
    } catch (error) {
      next(error);
    }
  }
);

authorRouter.post("/register", async (req, res, next) => {
  try {
    const newAuthor = new authorModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authorRouter.get(
  "/googleRedirect",
  passport.authenticate("google", { session: false }),
  async (req, res, next) => {
    res.redirect(`${process.env.FE_URL}/?accessToken=${req.user.accessToken}`);
  }
);

authorRouter.get("/me/stories", authMiddleware, async (req, res, next) => {
  try {
    const posts = await BlogModel.find({ author: req.author._id });
    res.send(posts);
  } catch (error) {
    next(error);
  }
});

authorRouter.put("/me", authMiddleware, async (req, res, next) => {
  try {
    const author = await authorModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (author) {
      res.send(author);
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

authorRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorRouter.delete("/me", authMiddleware, async (req, res, next) => {
  try {
    const author = await authorModel.findByIdAndDelete(req.author._id);
    if (author) {
      res.status(204).send("Deleted");
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

authorRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await authorModel.checkCredentials(email, password);
    if (author) {
      const payload = { _id: author._id, role: author.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Incorrect credentials"));
    }
  } catch (error) {
    next(error);
  }
});

authorRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await authorModel.findById(req.params.id);
    if (author) {
      res.send(author);
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

authorRouter.put("/:id", async (req, res, next) => {
  try {
    const author = await authorModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (author) {
      res.send(author);
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

authorRouter.delete("/:id", async (req, res, next) => {
  try {
    const author = await authorModel.findByIdAndDelete(req.params.id);
    if (author) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Author with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default authorRouter;
