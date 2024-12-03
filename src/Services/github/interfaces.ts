export interface commitInterface {
  url: string;
  commitMessage: string;
  content: string;
  branch: string;
  sha: string;
  access_token: string;
}

export interface branchInterface {
  repoOwner: string;
  repoName: string;
  branchName: string;
  access_token: string;
}

export interface pullRequestInterface {
  repoOwner: string;
  repoName: string;
  title: string;
  head: string; // source branch
  base: string; // target branch (usually 'main' or 'master')
  access_token: string;
}
