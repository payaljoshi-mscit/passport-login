'use strict'
var router=require("express").Router();
let passport=require('../config/passport') 
//var passport=require("passport");

/*

* To add new account need to create authentication, authorization, and unlink methods.
* i.e. 	****twitter authentication****
*			// scope is what you info you want to get from api - api specific inputs
*			router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }))
*			router.get('/auth/twitter/callback', passport.authenticate('twitter', {
*			successRedirect : '/profile', failureRedirect : '/'}))
*		****twitter authorized****
*			router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }))
*			router.get('/connect/twitter/callback', passport.authorize('twitter', {
*				successRedirect : '/profile', failureRedirect : '/'}))
*		****twitter unlink****
*			router.get('/unlink/twitter', function(req, res) {
*				let user = req.user
*				// delete token to disable account access
*				user.twitter.token = undefined
*				user.save(function(err) {
*					res.redirect('/profile')
*				})
*			})
*/



	/******************************normal routes***************************************/
	// show home page
	router.get('/', function(req, res) {
		res.render('index.ejs')
	})
	// show profile page
	router.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		})
	})
	// logout page
	router.get('/logout', function(req, res) {
		req.logout(); //passport function for logout
		res.redirect('/')
	})

	/*******************************local authentication****************************/
	// show login page
	router.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') })
	})

	// process a login 
	router.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // if success redirect to profile page
		failureRedirect : '/login', // if failure rediect to login page
		failureFlash : true // allow flash messages
	}))

	

	/******show sign up page*****/
	router.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('loginMessage') })
	})

	/******process a sign up*****/
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}))






	/****************************facebook authentication***************************/
	router.get('/auth/facebook', passport.authenticate('facebook', { 
		// what data router is allowed to get from facebook
		// ADD permission in router Review -> Requests
		scope : ['email']
	}))
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/******************************github authentication*************************/
	router.get('/auth/github', passport.authenticate('github', { scope : 'email' }))
	router.get('/auth/github/callback', passport.authenticate('github', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))




	/*******************************locally authorized******************************/
	router.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', { message: req.flash('loginMessage') })
	})
	router.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/connect/local',
		failureFlash : true
	}))

	/******************************facebook authorized******************************/
	router.get('/connect/facebook', passport.authorize('facebook', { 
		scope : ['email']
	}))

	/*router.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))*/

	/**************************twitter authorized***********************************/
	router.get('/connect/github', passport.authorize('github', { 
		scope : 'email' 
	}))

	router.get('/connect/github/callback', passport.authorize('github', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))




	/***************************unlink local account******************************/
	router.get('/unlink/local', function(req, res) {
		let user = req.user
		user.local.email = undefined
		user.local.password = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink facebook account***************************/
	router.get('/unlink/facebook', function(req, res) {
		let user = req.user
		user.facebook.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/***************************unlink github account***************************/
	router.get('/unlink/github', function(req, res) {
		let user = req.user
		user.github.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})

	module.exports =router

/********** check to see if user is authenticated for profile access***********/
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) 
		return next() // if authenticated then go to next middleware
	res.redirect('/') // if not authenticated then redirect to home page
}