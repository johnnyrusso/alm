const express = require("express"),
    bodyParser = require("body-parser"),
    router = express.Router();

router.get('/about', function(req, res) {
    res.render('./content/about')
});
module.exports = router;