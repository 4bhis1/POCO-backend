import { Router } from "express";
import { createRepo } from "../controller/github.controller";

const unauthenticatedApis = Router();

unauthenticatedApis.post("/create-repo", async (req: any, res: any) => {
  console.log(">>> unauthenticatedApis");
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

export default unauthenticatedApis;
