const express = require("express"),
    bodyParser = require("body-parser"),
    router = express.Router();

router.get('/show', function(req, res) {
    res.render('./gallery/show2')
});
module.exports = router;