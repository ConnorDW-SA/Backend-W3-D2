import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BlogSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number },
      unit: { type: String }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true
    },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export default model("Blog", BlogSchema);
