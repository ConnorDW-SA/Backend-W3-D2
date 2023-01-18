import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CommentSchema = new Schema(
  {
    commenter: { type: String, required: true },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

export default model("Comment", CommentSchema);
