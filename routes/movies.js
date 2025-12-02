const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Movie = require("../models/movie");
const User = require("../models/user");

// Genres
const genres = ["Adventure", "Science fiction", "Tragedy", "Romance", "Horror", "Comedy"];

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/users/login");
}

// List all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.render("index", { movies, user: req.user });
  } catch (err) {
    console.error(err);
    res.send("Error retrieving movies");
  }
});

// Add Movie
router.route("/add")
  .get(ensureAuthenticated, (req, res) => res.render("add-movie", { genres }))
  .post(ensureAuthenticated, async (req, res) => {
    await check("name", "Name is required").notEmpty().run(req);
    await check("description", "Description is required").notEmpty().run(req);
    await check("year", "Year must be a valid 4-digit number").isInt({ min: 1900, max: 2099 }).run(req);
    await check("rating", "Rating must be a number between 0 and 10").isFloat({ min: 0, max: 10 }).run(req);
    await check("genres", "Genre is required").notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.render("add-movie", { errors: errors.array(), genres });

    try {
      const movie = new Movie({
        name: req.body.name,
        description: req.body.description,
        year: req.body.year,
        genres: req.body.genres,
        rating: req.body.rating,
        posted_by: req.user.id
      });
      await movie.save();
      res.redirect(`/movies/${movie._id}`);
    } catch (err) {
      console.error(err);
      res.send("Could not save movie");
    }
  });

// Edit Movie
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.send("Could not find movie");

    // Ownership check
    if (movie.posted_by.toString() !== req.user._id.toString()) return res.status(403).send("Unauthorized");

    res.render("edit-movie", { movie, genres });
  } catch (err) {
    console.error(err);
    res.send("Error retrieving movie");
  }
});

router.post("/edit/:id", ensureAuthenticated, async (req, res) => {
  await check("name", "Name is required").notEmpty().run(req);
  await check("description", "Description is required").notEmpty().run(req);
  await check("year", "Year must be a valid 4-digit number").isInt({ min: 1900, max: 2099 }).run(req);
  await check("rating", "Rating must be a number between 0 and 10").isFloat({ min: 0, max: 10 }).run(req);
  await check("genres", "Genre is required").notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const movie = await Movie.findById(req.params.id);
    return res.render("edit-movie", { errors: errors.array(), movie, genres });
  }

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.send("Could not find movie");

    // Ownership check
    if (movie.posted_by.toString() !== req.user._id.toString()) return res.status(403).send("Unauthorized");

    const movieData = {
      name: req.body.name,
      description: req.body.description,
      year: req.body.year,
      genres: req.body.genres,
      rating: req.body.rating,
    };

    await Movie.updateOne({ _id: req.params.id }, movieData);
    res.redirect(`/movies/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.send("Error updating movie");
  }
});

// Movie detail
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.send("Could not find movie");

    const posted_by_user = await User.findById(movie.posted_by);

    res.render("movie", {
      movie,
      posted_by: posted_by_user ? posted_by_user.name : "Unknown",
      user: req.user // For showing edit/delete buttons
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading movie");
  }
});

// Delete Movie
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Could not find movie");

    // Ownership check
    if (movie.posted_by.toString() !== req.user._id.toString()) return res.status(403).send("Unauthorized");

    await Movie.deleteOne({ _id: req.params.id });
    res.send("Successfully Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting movie");
  }
});

module.exports = router;
