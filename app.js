var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
var passport = require("passport");

require("./passport");
//--------------------------------------------------------------view engine setup4

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//------------------------------------------------------------routes
app.use("/", require("./routes/index"));
app.use("/user", require("./user/userRoute"));
app.use(
  "/me",
  passport.authenticate("jwt", { session: false }),
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
