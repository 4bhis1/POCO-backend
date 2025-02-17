import { projectDescription } from "./constants/poco";
import GitHubService from "./Services/github/github.service";

export const main = async () => {
  const accessToken = "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"; // Replace with your GitHub token
  const userName = "4bhis1"; // Replace with your GitHub username
  const repoName = "test-repo-1"; // Replace with your repository name

  const gitHubService = new GitHubService(accessToken);

  try {
    // Step 1: Create the repository
    // console.log("Creating repository...");
    // const createRepoResponse = await gitHubService.createRepo(
    //   repoName,
    //   projectDescription,
    //   true // Private repository
    // );
    // console.log("Repository created:", createRepoResponse);

    // Set the repository and username in the service
    gitHubService.setRepoName = repoName;
    gitHubService.setUserName = userName;

    // Step 2: Create an initial commit if the repository is empty
    // console.log("Creating initial commit...");
    // await gitHubService.makeInitialCommit("675090987db275c82d2af2f7");

    // // Step 3: Create the main branch
    // console.log("Creating branch...");
    // const createBranchResponse = await gitHubService.createBranch({
    //   branchName: "main",
    // });
    // console.log("Branch created:", createBranchResponse);

    // Step 4: Commit files
    const files = [
      {
        filePath: "docs/README.md",
        content: "Hello from Poko - README File",
      },
      {
        filePath: "docs/info.txt",
        content: "This is some additional information I need to change.",
      },
    ];

    console.log("Committing files...");

    const commitResponse = await gitHubService.commitFilesToRepo({
      files,
      commitMessage: "Initial commit with multiple files",
      branch: "main",
    });
    console.log("Files committed:", commitResponse);
  } catch (error: any) {
    console.error("An error occurred:", error.response?.data || error.message);
  }
};

main();
