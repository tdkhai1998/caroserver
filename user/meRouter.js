var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
const model = require("./userModel");

router.get("/", (req, res, next) => {
  return model
    .findOne(req.user.username)
    .then(([r]) => {
      r.password = undefined;
      res.json(JSON.stringify({ code: 1, data: r }));
    })
    .catch(e => res.json(JSON.stringify({ code: -1, error: e.message })));
});
module.exports = router;
