const { default: axios } = require("axios");

const commitGithub = async () => {
  const response = await axios.put(
    url,
    {
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      branch,
      sha,
    },
    {
      headers: {
        Authorization: `Bearer ${personalAccessToken}`,
      },
    }
  );

  return response;
};

module.exports = {
  commitGithub,
};
