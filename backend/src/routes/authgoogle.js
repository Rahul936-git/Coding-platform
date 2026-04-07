const express = require("express");
const passport = require("../config/google");
const googleFetch = require("../controllers/googleAPI");

const authGoogleRouter = express.Router();

authGoogleRouter.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  // prompt: "select_account"
}));

authGoogleRouter.get(
  "/google/callback",
  passport.authenticate("google",{
    session: false
  }),googleFetch);

module.exports = authGoogleRouter;