const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const userModel = require("../user/userModel");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require("bcrypt");
const configAuth = require("./config");

var FacebookStrategy = require("passport-facebook").Strategy;
// var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const facebookStrategy = new FacebookStrategy(
    {
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
    },
    function(accessToken, refreshToken, profile, done) {
        var username = "fb-" + profile.id;
        userModel
            .findByEmail(username)
            .then(rows => {
                if (rows.length == 0) {
                    var entity = userModel.createEntity(username, "");
                    return userModel
                        .add(entity)
                        .then(n => {
                            return done(null, entity);
                        })
                        .catch(err => {
                            next(err);
                        });
                } else {
                    const user = rows[0];
                    return done(null, user);
                }
            })
            .catch(err => {
                next(err);
            });
    },
);

var localStrategy = new LocalStrategy(
    {
        usernameField: "username",
        passwordField: "password",
    },
    function(username, password, cb) {
        return userModel
            .findOne(username)
            .then(result => {
                console.log(result);

                if (result.length === 0) {
                    return cb(null, false, {
                        message: "Incorrect email or password.",
                    });
                }
                const user = result[0];
                console.log(user);
                if (bcrypt.compareSync(password, user.password))
                    return cb(null, user, {
                        message: "Logged In Successfully",
                    });
                else
                    return cb(null, false, {
                        message: "Incorrect email or password.",
                    });
            })
            .catch(err => {
                console.log(result);
                return cb(err).catch(err => console.log(err));
            });
    },
);
const jwt = new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: "your_jwt_secret",
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
    },
);

module.exports = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(localStrategy);
    passport.use(jwt);
    passport.serializeUser((user, done) => {
        return done(null, user);
    });
    passport.deserializeUser((user, done) => {
        return done(null, user);
    });
};
// const Gg = new GoogleStrategy(
//   {
//     clientID:
//       "42436615068-825kl2c6821halea911qm0s949a5jhea.apps.googleusercontent.com",
//     clientSecret: "C6JRoNBEzLG2jrJuKM-Jf-AI",
//     callbackURL: "https://hkhweb.herokuapp.com/account/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     var username = "gg-" + profile.id;
//     userModel
//       .single(username)
//       .then(rows => {
//         if (rows.length == 0) {
//           var entity = createEntity(profile, username);
//           userModel
//             .add(entity)
//             .then(n => {
//               userModel
//                 .single(username)
//                 .then(rows1 => {
//                   var user = rows1[0];
//                   return done(null, user);
//                 })
//                 .catch(err => {
//                   console.log(err);
//                 });
//             })
//             .catch(err => {
//               console.log(err);
//             });
//         } else {
//           userModel
//             .single(username)
//             .then(rows1 => {
//               var user = rows1[0];
//               return done(null, user);
//             })
//             .catch(err => {
//               console.log(err);
//             });
//         }
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// );

// const Fb=new FacebookStrategy(
//     {
//       clientID: "344365016499860",
//       clientSecret: "40fd6a3626d8fd3e87b430ed02c108b7",
//       callbackURL:
//         "https://hkhweb.herokuapp.com/account/auth/facebook/callback"
//     },
//     function(accessToken, refreshToken, profile, done) {
//       var username = "fb-" + profile.id;
//       userModel
//         .single(username)
//         .then(rows => {
//           if (rows.length == 0) {
//             var entity = createEntity(profile, username);
//             userModel
//               .add(entity)
//               .then(n => {
//                 userModel
//                   .single(username)
//                   .then(rows1 => {
//                     var user = rows1[0];
//                     return done(null, user);
//                   })
//                   .catch(err => {
//                     console.log(err);
//                   });
//               })
//               .catch(err => {
//                 console.log(err);
//               });
//           } else {
//             userModel
//               .single(username)
//               .then(rows1 => {
//                 var user = rows1[0];
//                 return done(null, user);
//               })
//               .catch(err => {
//                 console.log(err);
//               });
//           }
//         })
//         .catch(err => {
//           console.log(err);
//         });
//     }
// );
