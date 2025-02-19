import { precommit } from "../constants/poco";
import UserSubmission from "../models/submissions.model";
import User from "../models/users.model";
import ApiError from "../utils/apiError";
import { decrypt } from "../utils/encryptDecrypt";
import GitHubService from "./github/github.service";
import languageExtensions from "../constants/languages";
import moment from "moment";

// Utility to initialize GitHubService
const initializeGitHubService = (
  accessToken: string,
  username = "",
  repo = ""
): InstanceType<typeof GitHubService> => {
  const decryptedAccessToken = decrypt(accessToken);
  return new GitHubService(decryptedAccessToken, username, repo);
};

// Function to get or update SHA of a file
const getOrUpdateSha = async (
  gitHubService: InstanceType<typeof GitHubService>,
  repo: string,
  filePath: string,
  currentSha?: string
): Promise<string> => {
  if (currentSha) return currentSha;
  return gitHubService.getShaFile(`${repo}/contents/${filePath}`);
};

interface UpdateSha {
  repo_readme_sha?: string;
  profile_readme_sha?: string;
}

interface CommitProfileReadmeParams {
  user_id: string;
  decryptedGitToken: string;
  gitUserName: string;
  readmeSha: string;
}

const commitProfileReadme = async ({
  user_id,
  decryptedGitToken,
  gitUserName,
  readmeSha,
}: CommitProfileReadmeParams): Promise<void> => {
  const gitHubService = new GitHubService(
    decryptedGitToken,
    gitUserName,
    gitUserName
  );
  await gitHubService.commitFilesToRepo({
    files: [
      { filePath: "README.md", content: precommit(user_id), sha: readmeSha },
    ],
    commitMessage: `Streak ${new Date().toISOString()}`,
  });
};

interface UserProfile {
  repo_readme_sha?: string;
  profile_readme_sha?: string;
  show_streak_profile: boolean;
  github_profile: string;
  github_username: string;
  github_access_token: string;
  github_repo: string;
}

const commitReadmeFile = async (
  user_id: string,
  questionName: string,
  user: UserProfile
): Promise<void> => {
  if (!user.github_access_token) {
    throw new ApiError(400, "GitHub access token not found.");
  }

  const gitHubService = initializeGitHubService(
    user.github_access_token,
    user.github_username,
    user.github_repo
  );
  const updateBody: UpdateSha = {};

  // Get or update repo README SHA
  const repoReadmeSha = await getOrUpdateSha(
    gitHubService,
    user.github_repo,
    "README.md",
    user.repo_readme_sha
  );
  if (!user.repo_readme_sha) updateBody.repo_readme_sha = repoReadmeSha;

  // Commit to repo README
  await gitHubService.commitFilesToRepo({
    files: [
      {
        filePath: "README.md",
        content: precommit(user_id),
        sha: repoReadmeSha,
      },
    ],
    commitMessage: questionName,
  });

  // Commit to profile README if enabled
  if (user.show_streak_profile && user.github_username) {
    const profileGitHubService = initializeGitHubService(
      user.github_access_token,
      user.github_username,
      user.github_username
    );
    const profileReadmeSha = await getOrUpdateSha(
      profileGitHubService,
      user.github_repo,
      "README.md",
      user.profile_readme_sha
    );
    if (!user.profile_readme_sha)
      updateBody.profile_readme_sha = profileReadmeSha;

    await commitProfileReadme({
      user_id,
      decryptedGitToken: decrypt(user.github_access_token),
      gitUserName: user.github_username,
      readmeSha: profileReadmeSha,
    });
  }

  // Update user record if SHA values changed
  if (Object.keys(updateBody).length) {
    await User.updateOne({ _id: user_id }, { $set: updateBody });
  }
};

interface CommitSubmissionParams {
  user: UserProfile;
  platform: "gfg" | "leetcode" | "bfe";
  questionName: string;
  question: string;
  language: keyof typeof languageExtensions;
  solution: string;
}

interface SubmitServiceParams extends CommitSubmissionParams {
  difficulty: string;
  user_id: string;
  user?: UserProfile;
}

const questionToString = (question: any) => {
  if (typeof question === "string") {
    return question;
  }

  if (!question || typeof question !== "object") {
    return JSON.stringify(question);
  }

  const { description, examples, constraints } = question;

  let result = "\n# QUESTION \n\n";
  result += `${description}\n\n`;

  if (examples && Array.isArray(examples)) {
    result += "### EXAMPLES \n\n";
    examples.forEach((example, index) => {
      result += `${index + 1}. ${example}\n\n`;
    });
  }

  if (constraints && Array.isArray(constraints)) {
    result += "### CONSTRAINTS \n\n";
    constraints.forEach((constraint) => {
      result += `- ${constraint}\n`;
    });
  }

  return result.trim();
};

const commitSubmission = async ({
  user,
  platform,
  questionName,
  question,
  language,
  solution,
}: CommitSubmissionParams): Promise<void> => {
  const gitHubService = initializeGitHubService(
    user.github_access_token,
    user.github_username,
    user.github_repo
  );

  await gitHubService.commitFilesToRepo({
    files: [
      {
        filePath: `${platform}/${questionName}/Question.md`,
        content: questionToString(question),
      },
      {
        filePath: `${platform}/${questionName}/Sol-${moment().format(
          "DD-MMM-YYYY"
        )}${languageExtensions?.[language] || ""}`,
        content: solution,
      },
      {
        filePath: `${platform}/${questionName}/Note.md`,
        content: `# Notes`,
      },
    ],
    commitMessage: questionName,
  });
};

const submitService = async (body: SubmitServiceParams): Promise<void> => {
  const {
    question,
    solution,
    platform,
    questionName,
    difficulty,
    language,
    user_id,
  } = body;
  const github_folder_path = `${platform}/${questionName}/sol-${moment().format(
    "DD-MMM-YY"
  )}`;
  
  const submission = new UserSubmission({
    user_id,
    question_id: questionName,
    platform,
    title: questionName,
    difficulty,
    language,
    github_folder_path,
  });
  await submission.save();

  const user = await User.findOne(
    { _id: user_id },
    {
      repo_readme_sha: 1,
      profile_readme_sha: 1,
      show_streak_profile: 1,
      github_profile: 1,
      github_username: 1,
      github_access_token: 1,
      github_repo: 1,
    }
  ).lean();

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  try {
    // Commit solution
    await commitSubmission({
      user,
      platform,
      questionName,
      question,
      language,
      solution,
    });
  } catch (err) {
    console.log(">>> error in commit Service", err);
  }

  // Commit README changes
  await commitReadmeFile(user_id, questionName, user);
};

export { submitService };
