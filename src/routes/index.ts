import { Router } from "express";
import {
  successPage,
  userProfile,
  userProfileHtml,
} from "../controller/user.controller";
import { createRepo } from "../controller/github.controller";
import User from "../models/users.model";

const router = Router();

// /**
//  * @route POST /create-repo
//  * @description This route allows authenticated users to create a new GitHub repository.
//  * @access Private
//  * @payload {Object}
//  * @payloadField {string} repo-name - The name of the repository to be created.
//  * @payloadField {string} branch - The default branch for the repository (e.g., "main" or "master").
//  * @returns {Object} 200 OK with repository creation details or error message
//  * @example
//  * {
//  *   "repo-name": "new-repo",
//  *   "branch": "main"
//  * }
//  */
// router("/create-repo");

// /**
//  * @route POST /submit
//  * @description This route receives the user's submission from an extension and records the data.
//  * @access Private
//  * @payload {Object}
//  * @payloadField {string} platform - The platform where the question is solved (e.g., "LeetCode", "GeeksforGeeks").
//  * @payloadField {string} question - The question text or description.
//  * @payloadField {string} solution - The solution provided by the user.
//  * @payloadField {string} difficulty - The difficulty level of the question (e.g., "Easy", "Medium", "Hard").
//  * @payloadField {string} question_id - Unique identifier for the question.
//  * @payloadField {string} title - Title of the question.
//  * @returns {Object} 200 OK with submission status or error message
//  * @example
//  * {
//  *   "platform": "LeetCode",
//  *   "question": "Two Sum",
//  *   "solution": "function twoSum(nums, target) {...}",
//  *   "difficulty": "Medium",
//  *   "question_id": "1a2b3c",
//  *   "title": "Two Sum Problem"
//  * }
//  */
router.post("/submit", async (req, res) => {
  console.log(">>> submit", req.headers);
});

// /**
//  * @route GET /user-detail
//  * @description This route retrieves the authenticated user's details, such as their streaks and questions solved today.
//  * @access Private
//  * @returns {Object} 200 OK with user data (streaks, questions solved today)
//  * @example
//  * {
//  *   "streaks": 10,
//  *   "questionsSolvedToday": 3
//  * }
//  */
// router("/user-streak");

router.get("/:user_id/profile", async (req, res) => {
  const { user_id } = req.params;

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

router.post("/create-repo", async (req, res) => {
  const { user_id, repoName, isPrivate, showSteakOnProfile } = req.body;
  try {
    await createRepo(user_id, repoName, isPrivate, showSteakOnProfile);
    res.status(200).json({
      status: "Success",
    });
  } catch (err: any) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  }
});

// Router("/user-data")

export default router;
