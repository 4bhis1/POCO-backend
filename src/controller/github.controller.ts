import { projectDescription } from "../constants/poco";
import User from "../models/users.model";
import GitHubService from "../Services/github/github.service";
import ApiError from "../utils/apiError";
import { decrypt } from "../utils/encryptDecrypt";

export const createRepo = async (
  user_id: string,
  repoName: string = "PO-CO",
  isPrivate: boolean = false,
  showSteakOnProfile: boolean = false
) => {
  const data = await User.findOne(
    { _id: user_id },
    {
      email: 1,
      profile_icon: 1,
      github_profile: 1,
      github_username: 1,
      github_access_token: 1,
      github_repo: 1,
    }
  );

  if (data?.github_repo) {
    throw new ApiError(500, "Repo already exist in respective of this user.");
  }

  if (data?.github_access_token) {
    const decryptedToken = decrypt(data?.github_access_token);
    try {
      const gitHubService = new GitHubService(decryptedToken);

      await gitHubService.createRepo(
        repoName,
        projectDescription,
        isPrivate // Private repository
      );

      await User.findOneAndUpdate(
        { _id: user_id },
        {
          $set: {
            github_repo: repoName,
            show_streak_on_profile: showSteakOnProfile,
          },
        }
      );

      gitHubService.setRepoName = repoName;
      gitHubService.setUserName = data.github_username || "";

      await gitHubService.makeInitialCommit(user_id);
    } catch (err: any) {
      throw new ApiError(500, "Can't create your github repo");
    }
  } else {
    throw new ApiError(500, "Github token not found");
  }
};

export const submit = async () => {};
