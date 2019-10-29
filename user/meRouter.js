var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
const model = require("./userModel");

router.get("/", (req, res, next) => {
  return model
    .findOne(req.user.username)
    .then(async ([r]) => {
      r.password = undefined;
      const fs = require("fs");
      const path = `${req.user.username}.txt`;
      const data = fs.readFileSync(path, "utf-8");
      r.avatar = data;
      res.json(JSON.stringify({ code: 1, data: r }));
    })
    .catch(e => res.json(JSON.stringify({ code: -1, error: e.message })));
});
module.exports = router;
