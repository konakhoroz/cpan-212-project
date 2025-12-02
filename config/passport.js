const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = function (passport) {
  // Local Strategy with email as username
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) return done(null, user);
        else return done(null, false, { message: "Invalid credentials" });
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user id to save in session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user from id stored in session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
