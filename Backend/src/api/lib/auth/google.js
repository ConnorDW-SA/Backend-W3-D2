import GoogleStrategy from "passport-google-oauth20";
import AuthorModel from "../../authors/model.js";
import { createAccessToken } from "./tools.js";

const GoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_KEY,
    callbackURL: `${process.env.BE_URL}/authors/googleRedirect`
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, given_name, family_name } = profile._json;

      const author = await AuthorModel.findOne({ email });
      if (author) {
        const accessToken = await createAccessToken({
          _id: author._id,
          role: author.role
        });
        passportNext(null, { accessToken });
      } else {
        const newAuthor = new AuthorModel({
          name: given_name,
          lastName: family_name,
          email,
          googleId: profile.id
        });
        const createdAuthor = await newAuthor.save();

        const accessToken = await createAccessToken({
          _id: createdAuthor._id,
          role: createdAuthor.role
        });
        passportNext(null, { accessToken });
      }
    } catch (error) {
      console.log(error);
      passportNext(error);
    }
  }
);

export default GoogleStrategy;
