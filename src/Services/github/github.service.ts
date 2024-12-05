import axios from "axios";
import { branchInterface, pullRequestInterface } from "./interfaces";
import { precommit } from "../../constants/poco";

class GitHubService {
  private access_token: string;
  private repo_name: string | undefined;
  private user_name: string | undefined;

  constructor(access_token: string, user_name?: string, repo_name?: string) {
    this.access_token = access_token;
    this.repo_name = repo_name;
    this.user_name = user_name;
  }

  set setRepoName(repo_name: string) {
    this.repo_name = repo_name;
  }

  set setUserName(user_name: string) {
    this.user_name = user_name;
  }

  private async makeRequest(method: string, url: string, data: any = {}) {
    const response = await axios({
      method,
      url,
      headers: {
        Authorization: `Bearer ${this.access_token}`,
      },
      data,
    });
    return response.data;
  }

  // Helper method to construct API URL
  private getRepoUrl(): string {
    return `https://api.github.com/repos/${this.user_name}/${this.repo_name}`;
  }

  // Commit to a GitHub repository
  async commitFilesToRepo(props: {
    files: { filePath: string; content: string }[];
    commitMessage: string;
    branch: string;
  }): Promise<string> {
    const { files, commitMessage, branch } = props;

    for (const file of files) {
      const { filePath, content } = file;

      // Construct the API URL for the file path
      const url = `${this.getRepoUrl()}/contents/${filePath}`;

      // Encode the content in Base64 (required by GitHub API for raw content upload)
      const encodedContent = Buffer.from(content).toString("base64");

      // Prepare data for the FormData request
      const data = {
        message: commitMessage,
        content: encodedContent,
        branch,
      };

      // Make the PUT request for each file
      const response = await axios({
        method: "PUT",
        url,
        headers: {
          Authorization: `Bearer ${this.access_token}`,
          "Content-Type": "application/json", // GitHub expects JSON data, not actual multipart FormData here
        },
        data,
      });
    }

    return "All files committed successfully!";
  }

  // Create a new branch
  async createBranch(props: Omit<branchInterface, "url">): Promise<any> {
    console.log(
      ">>>> this.repoNamr this.ownener ame",
      this.repo_name,
      this.user_name
    );

    const { branchName } = props;
    const url = `${this.getRepoUrl()}/git/refs`;

    const data = {
      ref: `refs/heads/${branchName}`,
      sha: await this.getLatestCommitSha(),
    };

    const response = await this.makeRequest("POST", url, data);
    return response;
  }

  // Get the latest commit SHA for the default branch
  private async getLatestCommitSha(): Promise<string> {
    const url = `${this.getRepoUrl()}/git/refs/heads/main`; // or 'master'
    const response = await this.makeRequest("GET", url);
    return response.object.sha;
  }

  // Create a new GitHub repository
  async createRepo(
    repoName: string,
    description: string = "",
    privateRepo: boolean = true
  ): Promise<any> {
    const url = `https://api.github.com/user/repos`;

    const data = {
      name: repoName,
      description,
      private: privateRepo,
    };

    const response = await this.makeRequest("POST", url, data);
    return response;
  }

  // Get branch details
  async getBranch(props: branchInterface): Promise<any> {
    const { branchName } = props;
    const url = `${this.getRepoUrl()}/branches/${branchName}`;
    const response = await this.makeRequest("GET", url);
    return response;
  }

  // Create a pull request
  async createPullRequest(props: pullRequestInterface): Promise<any> {
    const { title, head, base } = props;
    const url = `${this.getRepoUrl()}/pulls`;

    const data = {
      title,
      head,
      base,
    };

    const response = await this.makeRequest("POST", url, data);
    return response;
  }

  // Merge a pull request
  async mergePullRequest(pullRequestId: number): Promise<any> {
    const url = `${this.getRepoUrl()}/pulls/${pullRequestId}/merge`;

    const data = {
      commit_message: `Merging PR #${pullRequestId}`,
    };

    const response = await this.makeRequest("PUT", url, data);
    return response;
  }

  async makeInitialCommit(user_id: string): Promise<void> {
    const url = `${this.getRepoUrl()}/contents/README.md`;

    const data = {
      message: "Initial commit by PO-CO",
      content: Buffer.from(precommit(user_id)).toString("base64"),
      branch: "main", // Specify the branch to create
    };

    try {
      await this.makeRequest("PUT", url, data);
    } catch (error: any) {
      console.error(
        "Error creating initial commit:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default GitHubService;
