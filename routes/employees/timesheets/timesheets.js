// Timesheet Routes
router.get("/timesheets/new", ensureAuthenticated, (req, res) => {
  res.render("./employees/timesheets/new", {
    firstName: req.user.firstName,
    email: req.user.email
  });
});

router.post("/timesheets/new", (req, res) => {
  const { location, task } = req.body;
  res.render("./employees/dashboard");
});
