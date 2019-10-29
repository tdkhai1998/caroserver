var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
var passport = require("passport");

//--------------------------------------------------------------view engine setup4
require("./middlewares/session")(app);
require("./middlewares/passport")(app);

const bodyParser = require("body-parser");
let allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT,    PATCH, DELETE"
  );
  next();
};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(allowCrossDomain);
app.options("*", function(req, res) {
  res.sendStatus(200);
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//------------------------------------------------------------routes
app.use("/", require("./routes/index"));
app.use("/user", require("./user/userRoute"));
app.use(
  "/me",
  passport.authenticate("jwt", { session: true }),
  require("./user/meRouter")
);
//------------------------------------------------------------catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//------------------------------------------------------------error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
