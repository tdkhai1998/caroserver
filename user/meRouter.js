var express = require("express");
var router = express.Router();

const model = require("./userModel");

router.get("/", (req, res, next) => {
    console.log(req.io);
    return model
        .findOne(req.user.username)
        .then(async ([r]) => {
            r.password = undefined;
            const fs = require("fs");
            const path = `${require("path").join(
                __dirname,
                "../public/images/avt/",
            ) + req.user.username}.txt`;
            const data = fs.readFileSync(path, "utf-8");
            r.avatar = data;
            res.json(JSON.stringify({code: 1, data: r}));
        })
        .catch(e => {
            console.log(e);
            return res.json(JSON.stringify({code: -1, error: e.message}));
        });
});
module.exports = router;
