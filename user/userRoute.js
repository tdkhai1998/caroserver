var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
router.post("/register", (req, res, next) => {
  const { username, password, repassword } = req.body;
  console.log(req.body);
  if (username && password && repassword && password === repassword) {
    return userModel
      .findOne(username)
      .then(async r => {
        if (r.length > 0) {
          res.json("account have already existed");
        } else {
          const id = await userModel.add(
            "user",
            userModel.createEntity(username, password)
          );
          res.json(JSON.stringify({ code: 1, message: "successfull" }));
        }
      })
      .catch(e => next(e));
  } else {
    console.log("do");
    res.json("Req don't have enough field (username, password,repassword) ");
  }
});
router.get("/logout", function(req, res, next) {
  req.logOut();
  return res.json(JSON.stringify({ code: 1, message: "successfull" }));
});
router.post("/login", function(req, res, next) {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(400)
        .json(JSON.stringify({ code: -1, message: "failed" }));
    }
    req.login(user, { session: false }, err => {
      if (err) {
        res.json(JSON.stringify({ code: -1, message: "failed" }));
      }
      const token = jwt.sign(JSON.stringify(user), "your_jwt_secret");
      return res.json(JSON.stringify({ code: 1, user, token }));
    });
  })(req, res);
});
module.exports = router;
