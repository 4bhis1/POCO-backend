import User from "../models/users.model";

interface authenticateUserArgs {
  username: string;
  email: string | undefined;
  name: string;
  accessToken: string;
}

export const authenticateUser = async (
  args: authenticateUserArgs
): Promise<void> => {
  const { username, email, name, accessToken } = args;
  console.log("🚀 ~ file: user.service.ts:14 ~ args:", args);

  const user = new User({
    name,
    github_profile: `github.com/${username}`,
    github_username: username,
    github_access_token: accessToken,
    email,
  });
  console.log("🚀 ~ file: user.service.ts:22 ~ user:", user);

  const data = await user.save();
  console.log(">>> data", data);

  const userData = await User.findOne({}, { github_access_token: 1, name: 1 });
  console.log("🚀 ~ file: user.service.ts:27 ~ userData:", userData);

};
