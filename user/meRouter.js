var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
router.get("/", (req, res, next) => {
  res.send(req.user);
});
module.exports = router;
