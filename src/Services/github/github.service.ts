import axios from "axios";
import {
  branchInterface,
  commitInterface,
  pullRequestInterface,
} from "./interfaces";

class GitHubService {
  private access_token: string;
  private repo_name: string | undefined;
  private user_name: string | undefined;

  constructor(access_token: string, user_name?: string, repo_name?: string) {
    this.access_token = access_token;
    this.repo_name = repo_name;
    this.user_name = this.user_name;
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
  private getRepoUrl(userName: string, repoName: string): string {
    return `https://api.github.com/repos/${userName}/${repoName}`;
  }

  // Commit to a GitHub repository
  async commitToRepo(props: Omit<commitInterface, "url">): Promise<string> {
    const { userName, repoName, commitMessage, content, branch, sha } = props;
    const url = `${this.getRepoUrl(userName, repoName)}/contents/README.md`; // Replace README.md with the target file path

    const response = await this.makeRequest("PUT", url, {
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      branch,
      sha,
    });

    console.log(">> response", response);
    return "Done";
  }

  // Create a new branch
  async createBranch(props: Omit<branchInterface, "url">): Promise<any> {
    const { repoOwner, repoName, branchName } = props;
    const url = `${this.getRepoUrl(repoOwner, repoName)}/git/refs`;

    const data = {
      ref: `refs/heads/${branchName}`,
      sha: await this.getLatestCommitSha(repoOwner, repoName),
    };

    const response = await this.makeRequest("POST", url, data);
    return response;
  }

  // Get the latest commit SHA for the default branch
  private async getLatestCommitSha(
    repoOwner: string,
    repoName: string
  ): Promise<string> {
    const url = `${this.getRepoUrl(repoOwner, repoName)}/git/refs/heads/main`; // or 'master'
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
    const { repoOwner, repoName, branchName } = props;
    const url = `${this.getRepoUrl(
      repoOwner,
      repoName
    )}/branches/${branchName}`;
    const response = await this.makeRequest("GET", url);
    return response;
  }

  // Create a pull request
  async createPullRequest(props: pullRequestInterface): Promise<any> {
    const { repoOwner, repoName, title, head, base } = props;
    const url = `${this.getRepoUrl(repoOwner, repoName)}/pulls`;

    const data = {
      title,
      head,
      base,
    };

    const response = await this.makeRequest("POST", url, data);
    return response;
  }

  // Merge a pull request
  async mergePullRequest(
    repoOwner: string,
    repoName: string,
    pullRequestId: number
  ): Promise<any> {
    const url = `${this.getRepoUrl(
      repoOwner,
      repoName
    )}/pulls/${pullRequestId}/merge`;

    const data = {
      commit_message: `Merging PR #${pullRequestId}`,
    };

    const response = await this.makeRequest("PUT", url, data);
    return response;
  }
}

export default GitHubService;
