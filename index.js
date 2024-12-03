require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const { submitService } = require("./src/Services/submit.service");

const app = express();

app.use(
  session({
    secret: process.env.GITHUB_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        "https://1009-2409-40d6-1007-5ae0-eca4-9c48-e4ff-d2eb.ngrok-free.app/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(
        "🚀 ~ file: index.js:36 ~ accessToken, refreshToken, profile, done:",
        accessToken,
        refreshToken,
        profile,
        done
      );
      const user = {
        username: profile.username,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        accessToken, // Store the access token
      };
      return done(null, user);
    }
  )
);

app.get("/health-check", (req, res) => {
  res.writeHead(200, {
    status: "running",
  });
  res.write(JSON.stringify({ message: "Success" }));
  res.end();
});

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["repo", "user:email"] })
);
app.get(
  "/auth/github/callback",
  (req, res, next) => {
    console.log(">> this request is been called");
    next();
  },
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    console.log("🚀 ~ file: index.js:72 ~ req:", req);
    // res.redirect("/profile");

    res.end();
  }
);

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT, () => {
  console.log(`PO-KO is running on port ${PORT}`, new Date());
  mongoose
    .connect(MONGO_URI, { autoIndex: false })
    .then(() => {
      console.log("Connected with PO-KO database");
    })
    .catch((e) => {
      console.log("Erorr while connecting PO-KO database", e);
    });
});

process.on("uncaughtException", (error) => {
  console.log("Uncaught error", error);
});
