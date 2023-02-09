import express from "express";
import createHttpError from "http-errors";
import blogModel from "./model.js";
import q2m from "query-to-mongo";

const blogRouter = express.Router();

blogRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await blogModel.countDocuments(mongoQuery.criteria);
    const blogs = await blogModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/blogs", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs
    });
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

blogRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await blogModel.find();
    res.send(blogs);
  } catch (error) {
    next(error);
  }
});

blogRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate("Author");
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
      res.status(204).send("Deleted");
    } else {
      next(createHttpError(404, `Blog with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//---------------------------Enbedded Comments---------------------------

blogRouter.post("/:id", async (req, res, next) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (blog) {
      const newComment = await BlogsModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              ...req.body
            }
          }
        },
        { new: true, runValidators: true }
      );
      res.send(newComment);
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

blogRouter.post("/:id/likes", async (req, res, next) => {
  try {
    const { id } = req.body;

    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return next(
        createHttpError(404, `Blog with id ${req.params.id} not found!`)
      );
    }

    const user = await userModel.findById(id);
    if (!user) {
      return next(createHttpError(404, `User with id ${id} not found!`));
    }

    const updatedBlog = await blogModel.findByIdAndUpdate(
      blog,
      { $push: { likes: user._id } },
      { new: true, runValidators: true }
    );
    res.send(updatedBlog);
  } catch (error) {
    next(error);
  }
});

export default blogRouter;
