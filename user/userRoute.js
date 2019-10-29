var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
  passport.authenticate("local", (err, user, info) => {
    if (err || !user) {
      return res
        .status(400)
        .json(JSON.stringify({ code: -1, message: "failed" }));
    }
    req.login(user, { session: true }, err => {
      if (err) {
        res.json(JSON.stringify({ code: -1, message: "failed" }));
      }
      const token = jwt.sign(JSON.stringify(user), "your_jwt_secret");
      return res.json(JSON.stringify({ code: 1, user: user.username, token }));
    });
  })(req, res);
});
router.put("/:id", function(req, res, next) {
  try {
    const { username } = req.body;
    const path = username + ".txt";
    const buffer = req.body.avatar;
    const fs = require("fs");
    require("fs").writeFile(path, buffer, "utf-8", function(err) {
      if (err) throw err;
      console.log("Ghi File Thành Công");
    });
    delete req.body.avatar;
    const { body } = req;
    const entity = userModel.createEmptyEntity();
    for (key in entity) {
      if (key === "ngaysinh") entity.ngaysinh = new Date(body.ngaysinh);
      else if (key === "gioitinh") entity.gioitinh = body.gioitinh === "Nam";
      else entity[key] = body[key];
    }
    console.log(entity);
    userModel
      .update(entity)
      .then(() => {
        return res.json(JSON.stringify({ code: 1, message: "Success" }));
      })
      .catch(e => {
        throw e;
      });
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});
router.get("/", async (req, res, next) => {
  return res.send(await userModel.all());
});
router.post("/changePassword", async (req, res, next) => {
  try {
    const { newPass, oldPass, username } = req.body;
    if (!newPass || !oldPass)
      return res.json(JSON.stringify({ code: -1, message: "Thiếu Param" }));
    let user = await userModel.findOne(username);
    user = user[0];
    if (bcrypt.compareSync(oldPass, user.password)) {
      user.password = bcrypt.hashSync(newPass, 10);
      userModel
        .update(user)
        .then(r => {
          console.log(r);
          return res.json(JSON.stringify({ code: 1, message: "Thành công" }));
        })
        .catch(e => {
          return res.json(JSON.stringify({ code: -1, message: e.message }));
        });
    } else {
      return res.json(
        JSON.stringify({ code: -1, message: "Mật khẩu cũ bị sai" })
      );
    }
  } catch (e) {
    console.log(e);

    return res.json(JSON.stringify({ code: -1, message: e.message }));
  }
});
module.exports = router;
