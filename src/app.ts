import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { authenticateUser } from "./Services/user.service";

dotenv.config();

const app = express();

// Type Definitions for User
interface User {
  username: string;
  email: string | undefined;
  name: string;
  accessToken: string;
}

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

// Serialize and Deserialize User
// passport.serializeUser((user: User, done) => done(null, user));
passport.deserializeUser((user: User, done: any) => done(null, user));

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3000/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: User | false) => void
    ) => {
      try {
        const user: User = {
          username: profile.username || "No username",
          email: profile.emails?.[0]?.value,
          name: profile.displayName || profile.username || "No name",
          accessToken, // Store the access token if needed
        };

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

// Handle Errors (Optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
