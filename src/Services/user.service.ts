import User from "../models/users.model";

interface authenticateUserArgs {
  username: string;
  email: string;
  name: string;
  accessToken: string;
}

export const authenticateUser = async (
  args: authenticateUserArgs
): Promise<void> => {
  const { username, email, name, accessToken } = args;

  const user = new User({
    name,
    github_profile: `github.com/${username}`,
    github_username: username,
    github_access_token: accessToken,
    email,
  });

  const data = await user.save();
  console.log(">>> data", data);

  const userData = await User.findOne({}, { github_access_token: 1, name: 1 });
  console.log("🚀 ~ file: user.service.ts:27 ~ userData:", userData);
};

console.log(">>> running user.Service");

authenticateUser({
  username: "4bhis1",
  email: "abhske@gmail.com",
  name: "abhishek kuamr",
  accessToken: "tihisiirfir frefrefref",
});
