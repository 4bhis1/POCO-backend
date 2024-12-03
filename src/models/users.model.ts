import mongoose from "mongoose";
import { decrypt } from "../utils/encryptDecrypt";
import colors from "../constants/color";
import Color from "../utils/schemas/color";
import Encrypt from "../utils/schemas/encrypt";

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    profile_icon: { type: String, trim: true },
    github_profile: { type: String, required: true, trim: true, unique: true },
    github_username: { type: String, required: true, trim: true, unique: true },
    github_access_token: { type: Encrypt, required: true, select: false },
    color: {
      type: Color,
      array: colors,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// schema.post("find", function (docs: [unknown]) {
//   docs.forEach((doc: any) => {
//     console.log(">>> this is to check if its here or nor", doc.github_access_token);
//     if (doc.github_access_token) {
//       const decrypted = decrypt(doc.github_access_token);
//       console.log(">>> decrypted", decrypted);
//       doc.github_access_token = decrypt(doc.github_access_token);
//     }
//   });
// });

schema.post("findOne", function (doc: any) {
  if (doc && doc.github_access_token) {
    console.log(
      "🚀 ~ file: users.model.ts:38 ~ doc.github_access_token:",
      doc.github_access_token
    );
    doc.github_access_token = decrypt(doc.github_access_token);
    console.log(
      "🚀 ~ file: users.model.ts:40 ~ doc.github_access_token:",
      doc.github_access_token
    );
  }
});

const User = mongoose.model("poko_user", schema);

export default User;
