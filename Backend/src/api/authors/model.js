import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const AuthorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["User", "Admin"], default: "User" },
    googleId: { type: String, required: false }
  },
  { timestamps: true }
);

AuthorSchema.pre("save", async function (next) {
  const author = this;
  if (author.isModified("password")) {
    const plainPw = author.password;
    author.password = await bcrypt.hash(plainPw, 10);
  }
  next();
});

AuthorSchema.methods.toJson = function () {
  const author = this;
  const authorObject = author.toObject();

  delete authorObject.password;
  delete authorObject.__v;
  delete authorObject.createdAt;
  delete authorObject.updatedAt;
  return authorObject;
};

AuthorSchema.static("checkCredentials", async function (email, password) {
  const author = await this.findOne({ email });
  if (author) {
    const pwMatch = await bcrypt.compare(password, author.password);
    if (pwMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("Author", AuthorSchema);
