import User from "../models/users.model";
import GitHubService from "../Services/github/github.service";
import ApiError from "../utils/apiError";
import { decrypt } from "../utils/encryptDecrypt";

const readMeConstant = `
# PO-CO: Centralized Coding Streak Tracker  

🚀 **Track your coding streaks across platforms with ease!**  
PO-CO is your all-in-one solution for unifying, visualizing, and celebrating your coding progress. Designed for passionate developers, PO-CO ensures your streaks are always up-to-date, no matter where or how you code.

## 🌟 Features  
- **Multi-Platform Integration:** Connect to GitHub, LeetCode, CodePen, and more.  
- **Real-Time Sync:** Keep your streaks updated automatically.  
- **Customizable Goals:** Define your "coding day" — commits, challenges, or projects.  
- **Insightful Analytics:** Charts, heatmaps, and leaderboards to monitor your progress.  
- **Gamification:** Earn badges and stay motivated.  


<img src="https://ed16-2405-201-5807-3027-fdf8-deb4-2df3-534e.ngrok-free.app/data" />
`;

export const createRepo = async (user_id: string, repoName: string) => {
  console.log(
    "🚀 ~ file: github.controller.ts:7 ~ createRepo ~ repoName:",
    repoName
  );
  const data = await User.findOne(
    { _id: user_id },
    {
      email: 1,
      profile_icon: 1,
      github_profile: 1,
      github_username: 1,
      github_access_token: 1,
    }
  );

  console.log(">>> data", data);

  if (data?.github_access_token) {
    const decryptedToken = decrypt(data.github_access_token);

    const github = new GitHubService(decryptedToken);
    const githubAccount = await github.createRepo(
      repoName,
      "PO-CO is an innovative tool designed to help developers monitor and maintain their coding streaks across multiple platforms like GitHub, LeetCode, CodePen, and more. Seamlessly track your progress, visualize your achievements, and stay motivated as you code everywhere.",
      false
    );


    const masterBranchdata = await github.createBranch()

    const commitdata = await github.commitToRepo();

    // console.log(">>> data", data, decryptedToken);

    return data;
  } else {
    throw new ApiError(500, "github token not found");
  }
};
