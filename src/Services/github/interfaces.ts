export interface commitInterface {
  url: string;
  commitMessage: string;
  content: string;
  branch: string;
  sha: string;
}

export interface branchInterface {
  branchName: string;
}

export interface pullRequestInterface {
  repoOwner: string;
  repoName: string;
  title: string;
  head: string; // source branch
  base: string; // target branch (usually 'main' or 'master')
}
