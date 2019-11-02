var express = require("express");
var userModel = require("../user/userModel");
var router = express.Router();
var passport = require("passport");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var pathJs = require("path");
var re = require("../bin/www");

router.post("/register", async (req, res, next) => {
    const {username, password, repassword} = req.body;
    console.log(req.body);
    if (username && password && repassword && password === repassword) {
        return userModel
            .findOne(username)
            .then(async r => {
                console.log(r);
                if (r.length > 0) {
                    console.log("taikhoan da ton tại");
                    return res.json(
                        JSON.stringify({
                            code: -1,
                            message: "Tài khoản đã tồn tại",
                        }),
                    );
                } else {
                    const path = `${pathJs.join(
                        __dirname,
                        "../public/images/avt/",
                    ) + username}.txt`;
                    const buffer = "";
                    require("fs").writeFile(path, buffer, "utf-8", err => {
                        if (err) console.log(err);
                        console.log("Ghi File Thành Công");
                    });
                    const user = userModel.createEntity(username, password);

                    console.log("entity", user);
                    const s = await userModel.add("user", user);
                    console.log("dang ky", s);
                    return res.json(
                        JSON.stringify({
                            code: 1,
                            message: "successfull",
                            insertId: s.insertId,
                        }),
                    );
                }
            })
            .catch(e => next(e));
    } else {
        console.log("do");
        return res.json(
            JSON.stringify({
                code: -1,
                message:
                    "Req don't have enough field (username, password,repassword) ",
            }),
        );
    }
});
router.get("/logout", (req, res) => {
    req.logOut();
    return res.json(JSON.stringify({code: 1, message: "successfull"}));
});
router.post("/login", (req, res) => {
    console.log(req.io);
    passport.authenticate("local", (err, user) => {
        if (err || !user) {
            return res
                .status(400)
                .json(JSON.stringify({code: -1, message: "failed"}));
        }
        req.login(user, {session: true}, err => {
            if (err) {
                res.json(JSON.stringify({code: -1, message: "failed"}));
            }
            const token = jwt.sign(JSON.stringify(user), "your_jwt_secret");
            return res.json(
                JSON.stringify({code: 1, user: user.username, token}),
            );
        });
    })(req, res);
});
router.put("/", (req, res) => {
    try {
        const {username} = req.body;
        const path = `${pathJs.join(__dirname, "../public/images/avt/") +
            username}.txt`;
        const buffer = req.body.avatar;
        require("fs").writeFile(path, buffer, "utf-8", err => {
            if (err) throw err;
            console.log("Ghi File Thành Công");
        });
        delete req.body.avatar;
        const {body} = req;
        console.log(req.body);

        const entity = userModel.createEmptyEntity();
        for (const key in entity) {
            if (key === "ngaysinh") entity.ngaysinh = new Date(body.ngaysinh);
            else if (key === "gioitinh")
                entity.gioitinh = body.gioitinh === "Nam";
            else entity[key] = body[key];
        }

        console.log(entity);
        userModel
            .update(entity)
            .then(r => {
                console.log(r);
                return res.json(JSON.stringify({code: 1, message: "Success"}));
            })
            .catch(e => {
                throw e;
            });
    } catch (e) {
        console.log(e);
        return res.sendStatus(400);
    }
});
router.post("/changePassword", async (req, res) => {
    try {
        const {newPass, oldPass, username} = req.body;
        if (!newPass || !oldPass)
            return res.json(JSON.stringify({code: -1, message: "Thiếu Param"}));
        let user = await userModel.findOne(username);
        user = user[0];
        if (bcrypt.compareSync(oldPass, user.password)) {
            user.password = bcrypt.hashSync(newPass, 10);
            userModel
                .update(user)
                .then(r => {
                    console.log(r);
                    return res.json(
                        JSON.stringify({code: 1, message: "Thành công"}),
                    );
                })
                .catch(e => {
                    return res.json(
                        JSON.stringify({code: -1, message: e.message}),
                    );
                });
        } else {
            return res.json(
                JSON.stringify({code: -1, message: "Mật khẩu cũ bị sai"}),
            );
        }
    } catch (e) {
        console.log(e);
        return res.json(JSON.stringify({code: -1, message: e.message}));
    }
});
router.post("/loginFace", (req, res) => {
    const data = req.body;
    return userModel
        .findOne(data.email || data.id)
        .then(rows => {
            if (rows.length === 0) {
                const user = userModel.createEmptyEntity();
                user.username = data.email || data.id;
                user.hoten = data.name;
                user.ngaysinh = new Date(data.birthday);
                user.gioitinh = data.gender === "male";
                user.role = 2;
                user.password = bcrypt.hashSync(data.id, 10);
                const path = `${pathJs.join(
                    __dirname,
                    "../public/images/avt/",
                ) + username}.txt`;
                const buffer = data.picture.data.url;
                require("fs").writeFile(path, buffer, "utf-8", err => {
                    if (err) console.log(err);
                    console.log("Ghi File Thành Công");
                });
                return userModel.add("user", user).then(() => {
                    const token = jwt.sign(
                        JSON.stringify(user),
                        "your_jwt_secret",
                    );
                    return res.json(
                        JSON.stringify({code: 1, user: user.username, token}),
                    );
                });
            } else {
                const user = rows[0];
                const token = jwt.sign(JSON.stringify(user), "your_jwt_secret");
                return res.json(
                    JSON.stringify({code: 1, user: user.username, token}),
                );
            }
        })
        .catch(e => res.json(JSON.stringify({code: -1, message: e.message})));
});

module.exports = router;
