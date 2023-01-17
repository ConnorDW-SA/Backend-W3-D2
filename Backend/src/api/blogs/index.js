import express from "express";
import createHttpError from "http-errors";
import userModel from "./model.js";

const blogRouter = express.Router();

blogRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await userModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new userModel(req.body);
    const { _id } = await newBlog.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await userModel.findById(req.params.id);
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
    const blog = await userModel.findByIdAndUpdate(req.params.id, req.body, {
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
    const blog = await userModel.findByIdAndDelete(req.params.id);
    if (blog) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default blogRouter;
