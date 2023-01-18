import express from "express";
import createHttpError from "http-errors";
import blogModel from "./model.js";
import commentModel from "../comments/model.js";

const blogRouter = express.Router();

blogRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await blogModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new blogModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (blog) {
      res.send(blog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.put("/:id", async (req, res, next) => {
  try {
    const blog = await blogModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
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

blogRouter.delete("/:id", async (req, res, next) => {
  try {
    const blog = await blogModel.findByIdAndDelete(req.params.id);
    if (blog) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//---------------------------Enbedded Comments---------------------------

blogRouter.post("/:id/comments", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id, { _id: 0 });
    if (blog) {
      const newComment = {
        ...blog.toObject(),
        commentDate: new Date(),
        ...req.body
      };
      const updatedBlog = await blogModel.findByIdAndUpdate(
        req.params.id,
        { $push: { comments: newComment } },
        { new: true, runValidators: true }
      );
      if (updatedBlog) {
        res.send(updatedBlog);
        console.log(updatedBlog);
      } else {
        next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
      }
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id/comments", async (req, res, next) => {
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

blogRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id, { _id: 0 });
    if (blog) {
      const comment = blog.comments.find(
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
});

blogRouter.put("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await blogModel.findByIdAndUpdate(req.params.id);
    if (blog) {
      const index = blog.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        blog.comments[index] = {
          ...blog.comments[index].toObject(),
          ...req.body
        };
        await blog.save();
        res.send(blog);
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
});

blogRouter.delete("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const newBlog = await blogModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (newBlog) {
      res.send(newBlog);
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default blogRouter;
