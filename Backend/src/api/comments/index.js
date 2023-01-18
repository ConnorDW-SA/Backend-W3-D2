import express from "express";
import q2m from "query-to-mongo";
import commentModel from "./model.js";

const commentRouter = express.Router();

commentRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await commentModel.countDocuments(mongoQuery.criteria);
    const comments = await commentModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/comments", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      comments
    });
  } catch (error) {
    next(error);
  }
});

export default commentRouter;
