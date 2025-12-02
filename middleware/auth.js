// middleware/auth.js

// Function to protect routes from unauthenticated users
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

module.exports = { ensureAuthenticated };
