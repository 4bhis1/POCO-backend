import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import cors from "cors";
import { authenticateReponse, User } from "./controller/user.controller";
import { authentication } from "./middleware/authentication.middleware";
import publicRoutes from "./routes/publicRoutes";
import privateRoutes from "./routes/privateRoutes";

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
  passport.authenticate("github", {
    scope: ["repo", "public_repo", "user:email"],
  })
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
      `chrome-extension://${process.env.EXTENSION_ID}/repo-selection.html?token=${user?.access_token}&user_id=${user.user_id}`
    );
  }
);

app.use("/api", authentication, privateRoutes);
app.use("", publicRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
