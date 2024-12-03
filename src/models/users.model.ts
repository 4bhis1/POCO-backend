import mongoose from "mongoose";
import Color from "../utils/schemas/color";
import Encrypt from "../utils/schemas/encrypt";
import { decrypt } from "../utils/encryptDecrypt";
import colors from "../constants/color";

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    github_profile: { type: String, required: true, trim: true, unique: true },
    github_username: { type: String, required: true, trim: true, unique: true },
    github_access_token: { type: Encrypt, required: true },
    color: {
      type: Color,
      array: colors,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

schema.post("find", function (docs: [unknown]) {
  docs.forEach((doc: any) => {
    if (doc.github_access_token) {
      doc.github_access_token = decrypt(doc.github_access_token);
    }
  });
});

schema.post("findOne", function (doc: any) {
  if (doc && doc.github_access_token) {
    doc.github_access_token = decrypt(doc.github_access_token);
  }
});

const User = mongoose.model("poko_user", schema);

export default User;
