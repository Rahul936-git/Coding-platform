const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACKURL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Called when Google sends user data
      // You can also save user in DB here
      return done(null, profile);
    }
  )
);

module.exports = passport;