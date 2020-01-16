module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/employees/login");
  },

  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/employees/dashboard");
  },

  ensureLevel: function (levelType) {
    return function (req, res, next) {
      if (req.user.access_level !== levelType) {
        req.flash("error_msg", "Unauthorized");
        res.redirect("/employees/dashboard");
      } else {
        return next();
      }
    }
  }

};