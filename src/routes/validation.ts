import languageExtensions from "../constants/languages";

export interface SubmitServiceParams {
  solution: string;
  difficulty: string;
  user_id: string;
  platform: "gfg" | "leetcode" | "bfe";
  questionName: string;
  question: string;
  language: keyof typeof languageExtensions;
}
