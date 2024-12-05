import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { authenticateUser } from "./Services/user.service";
import { getActivityCalendar } from "./Services/chart.service";
import { createRepo } from "./controller/github.controller";

dotenv.config();

const app = express();

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret", // Use a separate SESSION_SECRET
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

interface User {
  username: string;
  email?: string;
  name: string;
  accessToken: string;
}

// Serialize and Deserialize User
passport.serializeUser((user: User, done) => done(null, user));
passport.deserializeUser((user: User, done: any) => done(null, user));

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "https://ed16-2405-201-5807-3027-fdf8-deb4-2df3-534e.ngrok-free.app/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: User | false) => void
    ) => {
      console.log("🚀 ~ file: app.ts:53 ~ profile:", profile);
      try {
        let email = profile.emails?.[0]?.value;

        // Fetch emails if not provided in the profile
        if (!email) {
          const response = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "User-Agent": "PO-KO",
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

        await authenticateUser(user);

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Health Check Route
app.get("/health-check", (req: Request, res: Response) => {
  res.status(200).json({
    status: "running",
    message: "Server is healthy",
  });
});

// GitHub Authentication Routes
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["repo", "user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    // On successful authentication
    console.log("Authenticated User:", req.user);
    res.redirect("/profile"); // Redirect to a profile page or any other page
  }
);

// Example Profile Route (Requires Authentication)
app.get("/profile", (req: Request, res: Response): void => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Unauthorized" });
  }
  res.json({
    user: req.user,
    message: "Welcome to your profile",
  });
});

app.get("/data", async (req: Request, res: Response) => {
  const image = await getActivityCalendar([
    { date: "2024-01-01", activityCount: 5 },
    { date: "2024-01-02", activityCount: 2 },
    { date: "2024-01-03", activityCount: 8 },
  ]);

  res.set("Content-Type", "image/png");
  res.send(image);
});

app.get("/createRepository", async (req: Request, res: Response) => {
  await createRepo("675090987db275c82d2af2f7", "check1");

  res.end();
});

// Handle Errors (Optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
