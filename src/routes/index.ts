import { Router } from "express";
import { successPage, userProfileHtml } from "../controller/user.controller";
import { createRepo } from "../controller/github.controller";
import User from "../models/users.model";
import { submitService } from "../Services/submit.service";
import { SubmitServiceParams } from "./validation";
import { createStreak } from "../Services/chart/createStreak";

const router = Router();

router.post("/submit", async (req: any, res: any) => {
  const user_id: string = req.user_id;
  const {
    question,
    solution,
    platform,
    questionName,
    difficulty,
    language,
  }: SubmitServiceParams = req.body;

  try {
    await submitService({
      question,
      solution,
      platform,
      questionName,
      difficulty,
      language,
      user_id,
    });
  } catch (err: any) {
    console.log(">>> error in submit service", err);
    res.status(500).json({
      message: "Problem faced while submiting the data.",
    });
  }
});

router.get("/:user_id/profile", async (req: any, res: any) => {
  const user_id: string = req.user_id;

  const data = await User.findOne(
    { _id: user_id },
    {
      github_repo: 1,
    }
  );

  if (data?.github_repo) {
    res.send(successPage);
  }

  res.send(userProfileHtml(user_id));
});

router.post("/create-repo", async (req: any, res: any) => {
  const user_id: string = req.user_id;
  console.log(">>> user_id", user_id);
  const { repoName, isPrivate, show_streak_profile } = req.body;
  try {
    await createRepo(user_id, repoName, isPrivate, show_streak_profile);
    res.status(200).json({
      status: "Success",
    });
  } catch (err: any) {
    res.status(err.statusCode || "500").json({
      message: err.message,
    });
  }
});

router.get("/check", async (req: any, res: any) => {
  const user_id: string = req.user_id;

  const html = await createStreak({ isExtension: true, user_id });
  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  // Generate a dynamic ETag based on the content
  const hash = Buffer.from(html).toString("base64").slice(0, 10); // Simple hash for ETag
  res.set("ETag", hash);
  return res.send(html);
});

export default router;
