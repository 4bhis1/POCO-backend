import { Profile } from "passport-github2";
import { authenticateUser } from "../Services/user.service";

export interface User {
  username: string;
  email?: string;
  name: string;
  accessToken: string;
}

interface Props {
  user?: User;
  access_token?: string;
}

export const authenticateReponse = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, props?: Props) => void
) => {
  try {
    let email = profile.emails?.[0]?.value;

    // Fetch emails if not provided in the profile
    if (!email) {
      const response = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "PO-CO",
        },
      });

      const emails = await response.json();
      console.log("🚀 ~ file: app.ts:67 ~ emails:", emails);
      // Select the primary email if available
      const primaryEmail = emails.find((e: any) => e.primary)?.email;
      email = primaryEmail;
    }

    const user: User = {
      username: profile.username || "No username",
      email,
      name: profile.displayName || profile.username || "No name",
      accessToken, // Store the access token if needed
    };
    console.log("🚀 ~ file: app.ts:79 ~ user:", user);

    const access_token = await authenticateUser(user);

    return done(null, { user, access_token });
  } catch (error) {
    return done(error);
  }
};
