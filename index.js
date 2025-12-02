require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

// Initialize app
const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
}));

// Passport config
require("./config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make logged-in user available in templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Enable CORS
app.use(cors());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Routes
const userRoutes = require("./routes/users");
const movieRoutes = require("./routes/movies");

app.use("/users", userRoutes);
app.use("/movies", movieRoutes);

// Home page
const Movie = require("./models/movie");
app.get("/", async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.render("index", { movies });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading movies");
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
