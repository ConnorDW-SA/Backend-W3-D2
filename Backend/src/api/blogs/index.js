import express from "express";
import createHttpError from "http-errors";
import blogModel from "./model.js";
import q2m from "query-to-mongo";
import { adminMiddleware } from "../lib/auth/adminOnly.js";
import { JwtAuthMiddleware } from "../lib/auth/jwtAuth.js";

const blogRouter = express.Router();

blogRouter.get("/", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await blogModel.countDocuments(mongoQuery.criteria);
    const blogs = await blogModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort)
      .populate({ path: "author", select: "name surname" });
    res.send({
      links: mongoQuery.links("http://localhost:3001/blogs", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs
    });
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const newBlog = new blogModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate({
      path: "author",
      select: "name surname"
    });
    if (blog) {
      res.send(blog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.put("/:id", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await BlogsModel.findById(req.params.id).populate({
      path: "author",
      select: "name surname"
    });
    if (blog) {
      const author = blog.author.fid(
        (author) => author._id.toString() === req.author._id.toString()
      );
      if (author) {
        const updatedBlog = await BlogsModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );
        res.send(updatedBlog);
      } else {
        next(createHttpError(403, "You are not allowed to edit this blog!"));
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.delete("/:id", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate({
      path: "author",
      select: "name surname"
    });
    if (blog) {
      const author = blog.author.find(
        (author) => author._id.toString() === req.author._id.toString()
      );
      if (author) {
        const deletedBlog = await BlogsModel.findByIdAndDelete(req.params.id);
        res.status(204).send();
      } else {
        next(createHttpError(403, "You are not allowed to delete this blog!"));
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id/comments", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id, { _id: 0 });
    if (blog) {
      res.send(blog.comments);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/:id/comments", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.body.id, { _id: 0 });
    if (blog) {
      const comment = { ...blog.toObject(), date: new Date() };
      const updatedBlog = await BlogsModel.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: comment } },
        { new: true, runValidators: true }
      );
      res.send(updatedBlog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.get(
  "/:id/comments/:commentId",
  JwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const blog = await blogModel.findById(req.params.id, { _id: 0 });
      if (blog) {
        const comment = user.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (comment) {
          res.send(comment);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

blogRouter.put(
  "/:id/comments/:commentId",
  JwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const blog = await blogModel.findById(req.params.id, { _id: 0 });
      if (blog) {
        const comment = user.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (comment !== -1) {
          blog.comments[comment] = {
            ...blog.comments[comment].toObject(),
            ...req.body,
            date: new Date()
          };
          await blog.save();
          res.send(blog.comments[comment]);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

blogRouter.delete(
  "/:id/comments/:commentId",
  JwtAuthMiddleware,
  async (req, res, next) => {
    try {
      const blog = await blogModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true, runValidators: true }
      );
      if (blog) {
        res.send(blog);
      } else {
        next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogRouter;
