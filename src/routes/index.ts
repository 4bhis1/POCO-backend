import { Router } from "express";

const router = Router();

/**
 * @route GET /get-authenticated
 * @description This route checks if the user is authenticated.
 * @access Public
 * @returns {Object} 200 OK with user authentication status
 */
router("/get-authenticated");

/**
 * @route POST /create-repo
 * @description This route allows authenticated users to create a new GitHub repository.
 * @access Private
 * @payload {Object} 
 * @payloadField {string} repo-name - The name of the repository to be created.
 * @payloadField {string} branch - The default branch for the repository (e.g., "main" or "master").
 * @returns {Object} 200 OK with repository creation details or error message
 * @example
 * {
 *   "repo-name": "new-repo",
 *   "branch": "main"
 * }
 */
router("/create-repo");

/**
 * @route POST /submit
 * @description This route receives the user's submission from an extension and records the data.
 * @access Private
 * @payload {Object} 
 * @payloadField {string} platform - The platform where the question is solved (e.g., "LeetCode", "GeeksforGeeks").
 * @payloadField {string} question - The question text or description.
 * @payloadField {string} solution - The solution provided by the user.
 * @payloadField {string} difficulty - The difficulty level of the question (e.g., "Easy", "Medium", "Hard").
 * @payloadField {string} question_id - Unique identifier for the question.
 * @payloadField {string} title - Title of the question.
 * @returns {Object} 200 OK with submission status or error message
 * @example
 * {
 *   "platform": "LeetCode",
 *   "question": "Two Sum",
 *   "solution": "function twoSum(nums, target) {...}",
 *   "difficulty": "Medium",
 *   "question_id": "1a2b3c",
 *   "title": "Two Sum Problem"
 * }
 */
router("/submit");

/**
 * @route GET /user-detail
 * @description This route retrieves the authenticated user's details, such as their streaks and questions solved today.
 * @access Private
 * @returns {Object} 200 OK with user data (streaks, questions solved today)
 * @example
 * {
 *   "streaks": 10,
 *   "questionsSolvedToday": 3
 * }
 */
router("/user-detail");

export default router;
