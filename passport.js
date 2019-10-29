const passport = require("passport");
var createError = require("http-errors");
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;
const userModel = require("./user/userModel");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    function(username, password, cb) {
      return userModel
        .findOne(username)
        .then(result => {
          if (result.length === 0) {
            return cb(null, false, { message: "Incorrect email or password." });
          }
          const user = result[0];
          console.log(user);
          if (bcrypt.compareSync(password, user.password))
            return cb(null, user, {
              message: "Logged In Successfully"
            });
          else
            return cb(null, false, { message: "Incorrect email or password." });
        })
        .catch(err => {
          return cb(err).catch(err => console.log(err));
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret"
    },
    function(jwtPayload, cb) {
      return userModel
        .findOne(jwtPayload.username)
        .then(user => {
          if (user.length > 0) return cb(null, user[0]);
          return cb(createError(404));
        })
        .catch(err => {
          return cb(err);
        });
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
