import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { getActivityCalendar } from "./Services/chart.service";
import { authenticateReponse, User } from "./controller/user.controller";
import router from "./routes";

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

app.use(express.json());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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
        "https://one-indirectly-skink.ngrok-free.app/auth/github/callback",
    },
    authenticateReponse
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
    res.redirect(`/${req.user.user_id}/profile`); // Redirect to a profile page or any other page
  }
);

app.use("/api", router);

app.get("/:user_id/data/:timeStamp", async (req: Request, res: Response) => {
  const image = await getActivityCalendar([
    { date: "2024-01-01", activityCount: 5 },
    { date: "2024-01-02", activityCount: 2 },
    { date: "2024-01-03", activityCount: 8 },
    { date: "2024-01-04", activityCount: 8 },
    { date: "2024-01-05", activityCount: 3 },
  ]);

  res.set("Content-Type", "image/png");
  res.set("Cache-Control", "no-store");
  res.set("ETag", "unique-hash-value");
  res.set("Expires", new Date().toString());
  res.send(image);
});

// Handle Errors (Optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
