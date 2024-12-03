interface LanguageExtensions {
  [language: string]: string; // A dynamic key-value pair where the key is a string, and the value is also a string
}

// Defining constants for the languages and their corresponding file extensions
const languageExtensions: LanguageExtensions = {
  python: ".py",
  javascript: ".js",
  java: ".java",
  ruby: ".rb",
  c: ".c",
  cpp: ".cpp",
  typescript: ".ts",
  html: ".html",
  css: ".css",
  go: ".go",
  rust: ".rs",
  kotlin: ".kt",
  swift: ".swift",
  php: ".php",
  bash: ".sh",
  scala: ".scala",
  lua: ".lua",
  perl: ".pl",
  r: ".r",
  dart: ".dart",
  objectiveC: ".m", // Objective-C files have `.m` extension
  csharp: ".cs",
  sql: ".sql",
  vbnet: ".vb", // Visual Basic .NET
  delphi: ".pas", // Delphi files have `.pas` extension
};

export default languageExtensions;
