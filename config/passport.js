//'use strict'

// import orde is same as code order
let LocalStrategy = require('passport-local').Strategy;
let GitHubStrategy = require('passport-github2').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
    

// load the user model
let User = require('../models/user');

// load authorization keys
let configAuth = require('./auth')
var passport=require("passport")
/*
IMP:
The serialized user object is stored in req.user 
by PassportJS taken from req.session.passport.user 
(which is is populated by Express) with the help of 
Passport's deserializeUser method. 
*/
    // serialize user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })
    // deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })

    /******************************login login***************************/
    passport.use('local-login', new LocalStrategy({
        // names of form fields override default fields in passport module
        usernameField : 'email',
        passwordField : 'password',
        // pass in request from route to check if a user is logged in
        passReqToCallback : true  // to access req in callback
    },
    function(req, email, password, done) {
        // async for login to be done before db access
            // find user by email
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err) { return done(err) }

                // if no user is found send flash
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'))
                // if invalid password send flash
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
                // else login successful
                else
                    return done(null, user)
            })
        
    }))

    /************************local sign up***************************************/
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

            // see if email is used already
            User.findOne({'local.email': email}, function(err, existingUser) {
                // if error stop db connection and return error
                if (err) { return done(err) }

                // if email exists then send flash
                if (existingUser) 
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                //  if login successful connect to new local account
                if(req.user) {
                    let user = req.user //if user avail in req
                    user.local.email = email
                    user.local.password = user.generateHash(password)
                    user.save(function(err) {
                        if (err) { throw err }
                        return done(null, user)
                    })
                } 
                // else create new local account
                else {
                    // create user model
                    let newUser = new User()
                    newUser.local.email = email
                    newUser.local.password = newUser.generateHash(password)
                    newUser.save(function(err) {
                        if (err) { throw err }
                        return done(null, newUser)
                    })
                }

            })
        
    }))

//----------------------
    //FB
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.consumerKey,
        clientSecret: configAuth.facebookAuth.consumerSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback : true,
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']

        // With tpassReqToCallback : true,
        //req obj will be passed as the first argument to the verify callback.
        // http://www.passportjs.org/docs/authorize/
        //handling both authentication and authorization using a 
        //single strategy instance and set of routes
    },
    function(req, token, tokenSecret, profile, done) {
        //done = verify callback
        //If the credentials are valid, the verify callback invokes done to supply Passport with the user that authenticated.
        //console.log('req:', req)
        
            if (!req.user) //not connected to any ac
            {
                //check if user's fb account exists
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    //if fb ac exists but not token, update token received
                    if (user) {
                        if (!user.facebook.token) {
                            user.facebook.token = token
                            user.facebook.displayName = profile.displayName
                            user.facebook.pic = profile.photos[0].value

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.facebook.id = profile.id
                        newUser.facebook.token = token
                        newUser.facebook.displayName = profile.displayName
                        newUser.facebook.pic = profile.photos[0].value

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                //
                let user = req.user
                user.facebook.id = profile.id
                user.facebook.token = token
                user.facebook.displayName = profile.displayName
                user.facebook.pic = profile.photos[0].value

                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        

    }))


    /************************twitter sign up******************************************/
    
    passport.use(new GitHubStrategy({
        clientID: configAuth.githubAuth.clientID,
        clientSecret: configAuth.githubAuth.clientSecret,
        callbackURL: configAuth.githubAuth.callbackURL,
        passReqToCallback : true

    },
    function(req, token, tokenSecret, profile, done) {
        console.log('github:', profile)
            if (!req.user) {
                User.findOne({ 'github.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.github.token) {
                            user.github.token = token
                            user.github.username = profile.username
                            user.github.displayName = profile.displayName

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.github.id = profile.id
                        newUser.github.token = token
                        newUser.github.username = profile.username
                        newUser.github.displayName = profile.displayName

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                let user = req.user
                user.github.id = profile.id
                user.github.token = token
                user.github.username = profile.username
                user.github.displayName = profile.displayName

                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        

    }))
 // end of module.exports function
 module.exports = passport ;