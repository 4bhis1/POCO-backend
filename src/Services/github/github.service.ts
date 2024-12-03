import axios from "axios";
import {
  branchInterface,
  commitInterface,
  pullRequestInterface,
} from "./interfaces";

class GitHubService {
  private access_token: string;

  constructor(access_token: string) {
    this.access_token = access_token;
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

  // Commit to a GitHub repository
  async commitToRepo(props: commitInterface): Promise<string> {
    const { url, commitMessage, content, branch, sha } = props;

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
  async createBranch(props: branchInterface): Promise<any> {
    const { repoOwner, repoName, branchName } = props;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`;

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
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/main`; // or 'master'
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
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branchName}`;
    const response = await this.makeRequest("GET", url);
    return response;
  }

  // Create a pull request
  async createPullRequest(props: pullRequestInterface): Promise<any> {
    const { repoOwner, repoName, title, head, base } = props;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls`;

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
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pullRequestId}/merge`;

    const data = {
      commit_message: `Merging PR #${pullRequestId}`,
    };

    const response = await this.makeRequest("PUT", url, data);
    return response;
  }
}

export default GitHubService;
