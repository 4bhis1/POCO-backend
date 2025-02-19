import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { getActivityCalendar } from "./Services/chart.service";
import { authenticateReponse, User } from "./controller/user.controller";
import router from "./routes";
import cors from "cors";
import { authentication } from "./middleware/authentication.middleware";
import { createStreak } from "./Services/chart/createStreak";
import unauthenticatedApis from "./routes/unauthneitcatedRoutes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});
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
    // console.log(">>> req from githubCallback", req);
    const { user } = req;
    console.log("Authenticated User:", user);
    // res.redirect(`/${req.user.user_id}/profile`); // Redirect to a profile page or any other page
    res.redirect(
      `chrome-extension://coidmobgbclleaaebpnpiadhddfhlkpk/repo-selection.html?token=${user?.access_token}&user_id=${user.user_id}`
    );
  }
);

app.use("/api", authentication, router);
// app.use("/api", unauthenticatedApis);

app.get("/:user_id/user-streak/:type", async (req: Request, res: Response) => {
  const { type } = req.params;
  const { image, html } = await getActivityCalendar([
    { date: "2024-06-10", activityCount: 5 },
    { date: "2024-01-02", activityCount: 2 },
    { date: "2024-08-03", activityCount: 8 },
    { date: "2025-01-04", activityCount: 8 },
    { date: "2024-01-05", activityCount: 3 },
  ]);

  if (type === "image") {
    console.log(">>>> Image in streak-profiler");

    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-store");
    res.set("ETag", "unique-hash-value");
    return res.send(image);
  } else {
    console.log(">>>> Image in text-html");

    res.set("Content-Type", "text/html");
    res.set("Cache-Control", "no-store");
    res.set("ETag", "unique-hash-value");
    return res.send(html);
  }
});

app.get("/:user_id/check", async (req: any, res: any) => {
  const { user_id } = req.params;
  const html = await createStreak({ user_id });
  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  res.set("Content-Type", "text/html");
  res.set("Cache-Control", "no-store");

  // Generate a dynamic ETag based on the content
  const hash = Buffer.from(html).toString("base64").slice(0, 10); // Simple hash for ETag
  res.set("ETag", hash);

  // return res.send(html);
  return res.send(html);
});

// Handle Errors (Optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
