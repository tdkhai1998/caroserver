var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
router.post("/register", (req, res, next) => {
  const { username, password, repassword } = req.body;
  if (username && password && repassword && password === repassword) {
    return userModel
      .findOne(username)
      .then(async r => {
        if (r.length > 0) {
          res.send("account have already existed");
        } else {
          const id = await userModel.add(
            "user",
            userModel.createEntity(username, password)
          );
          res.send("created account successfully");
        }
      })
      .catch(e => next(e));
  } else {
    res.send("Req don't have enough field (username, password,repassword) ");
  }
});
router.post("/login", function(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : "Login failed",
        user: user
      });
    }
    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign(JSON.stringify(user), "your_jwt_secret");
      return res.json({ user, token });
    });
  })(req, res);
});
module.exports = router;
