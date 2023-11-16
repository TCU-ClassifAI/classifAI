const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dbconnect = require('./mongo');


// wip google auth, not done, also need to load in to server.js
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback" 
  },
  function(accessToken, refreshToken, profile, cb) {
    dbconnect.User.getUser({ userID: profile.id }, function (err, user) {
        if (err) {
            // Error in fetching user, may not necessarily mean user doesn't exist
            return cb(err);
        }
        
        if (user) {
            // User exists, return the user object
            return cb(null, user);
        } 
        else {
            // User doesn't exist, create a new user
            dbconnect.User.createUser({ userID: profile.id }, function (err, newUser) {
                if (err) {
                    // Error in creating a new user
                    return cb(err);
                }
                // New user created, return the new user object
                return cb(null, newUser);
            });
        }
    });
}));


// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user.id); 
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
    dbconnect.User.getUserById({ userID: id }, function (err, user) {
        done(err, user);
    });
});