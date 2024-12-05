import User from "../models/users.model";
import { generateAccessToken } from "../utils/jwtToken";

interface authenticateUserArgs {
  username: string;
  email?: string;
  name: string;
  accessToken: string;
}

export const authenticateUser = async (
  args: authenticateUserArgs
): Promise<string> => {
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

  return generateAccessToken(data._id);
};
