var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
//for sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    //creates token
    return jwt.sign(user, config.secretKey,
        //additional parameters
        { expiresIn: 3600 });
};

//setting up options
var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        options,
        (jwt_payload, done) => {
            console.log("JWT payload contains " + jwt_payload);
            User.findOne(
                { _id: jwt_payload._id },
                (err, user) => {
                    if (err) {
                        return done(err, false);
                    }
                    else if (user) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false);
                    }
                });
        }));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = function (req, res, next) {
    User.findOne({ _id: req.user._id })
        .then((user) => {
            console.log("User: ", req.user);
            if (user.admin) {
                next();
            }
            else {
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
};

