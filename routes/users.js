const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load User model
const User = require("../models/user");

// Register page
router.get("/register", (req, res) => res.render("register"));

// Register POST with strong password validation
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email")
      .notEmpty().withMessage("Email is required").bail()
      .isEmail().withMessage("Email is invalid"),
    check("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/).withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/).withMessage("Password must contain at least one special character (!@#$%^&*)"),
    check("confirm_password", "Passwords must match").custom((value, { req }) => value === req.body.password),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.render("register", { errors: errors.array(), ...req.body });

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.render("register", { errors: [{ msg: "Email already registered" }], ...req.body });

      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashedPassword });
      await user.save();
      res.redirect("/users/login");
    } catch (err) {
      console.error(err);
      res.render("register", { errors: [{ msg: "Server error" }], ...req.body });
    }
  }
);

// Login page
router.get("/login", (req, res) => res.render("login"));

// Login POST with validation
router.post(
  "/login",
  [
    check("email")
      .notEmpty().withMessage("Email is required").bail()
      .isEmail().withMessage("Email is invalid"),
    check("password").notEmpty().withMessage("Password is required")
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.render("login", { errors: errors.array(), ...req.body });

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(err);
        return res.render("login", { errors: [{ msg: "Server error" }], ...req.body });
      }
      if (!user) {
        return res.render("login", { errors: [{ msg: "Invalid email or password" }], ...req.body });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error(err);
          return res.render("login", { errors: [{ msg: "Login failed" }], ...req.body });
        }
        return res.redirect("/movies");
      });
    })(req, res, next);
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/users/login"));
});

module.exports = router;
