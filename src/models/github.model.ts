import mongoose from "mongoose";
import platforms from "../constants/platforms";
import difficulty from "../constants/difficulty";
import languageExtensions from "../constants/languages";

const { Schema } = mongoose;

const schema = new Schema(
  {
    user_id: { type: "ObjectId", ref: "User" },
    question_id: { type: String, required: true },
    platform: { type: String, required: true, enum: platforms },
    title: { type: String, required: true, trim: true }, //question title
    difficulty: { type: String, enum: difficulty, default: "easy" },
    tags: [{ type: String, trim: true }],
    language: {
      type: String,
      trim: true,
      required: true,
      enum: Object.keys(languageExtensions),
    },
    github_folder_path: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

schema.index({ user_id: 1 });
schema.index({ user_id: 1, updated_at: -1 });

const UserSubmission = mongoose.model("poko_user_submission", schema);

UserSubmission.createIndexes()
  .then(() => {
    console.log("Indexes created successfully : UserSubmission");
  })
  .catch((err: unknown) => {
    console.error("Error creating indexes UserSubmission:", err);
  });

export default UserSubmission;
