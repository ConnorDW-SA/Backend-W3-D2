import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BlogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, required: true },
    comments: [
      {
        comment: { type: String, required: true },
        rate: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

export default model("Blog", BlogSchema);
