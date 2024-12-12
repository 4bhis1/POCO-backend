import mongoose from "mongoose";
import { decrypt } from "../utils/encryptDecrypt";
import colors from "../constants/color";
import Color from "../utils/schemas/color";
import Encrypt from "../utils/schemas/encrypt";

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, unique: true },
    profile_icon: { type: String, trim: true },
    github_profile: { type: String, required: true, trim: true, unique: true },
    github_username: { type: String, required: true, trim: true, unique: true },
    github_access_token: { type: Encrypt, required: true, select: false },
    color: {
      type: Color,
      array: colors,
    },
    github_repo: { type: String },
    showSteakOnProfile: Boolean,
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const User = mongoose.model("poko_user", schema);

export default User;
