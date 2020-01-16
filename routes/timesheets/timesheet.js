/*jshint esversion: 6 */
const express = require("express"),
    bodyParser = require("body-parser"),
    { check, validationResult } = require("express-validator"),
    router = express.Router();

router.get("/new", (req, res) => {
    res.render("./timesheets/snew2");
});

router.post("/new", (req, res) => {
    res.send(req.body);
});

// router.post(
//   "/new",
//   [
//     check("employee")
//       .isLength({
//         min: 3
//       })
//       .withMessage("Must provide employee name")
//       .isAlpha()
//       .withMessage("Employee field must contain alpha characters only")
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({
//         errors: errors.array()
//       });
//     } else {
//       res.send(req.body);
//     }
//     const employee = req.body.employee;
//   }
// );

router.get("/ko", (req, res) => {
    res.render("./timesheets/ko");
});
// router.post("/new", (req, res) => {
//   res.render("./timesheets/success");
// });

module.exports = router;