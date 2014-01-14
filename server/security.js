var config = require('../config/cookie-config.js'),
	passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy;

module.exports = {
    init: function(app) {

		passport.serializeUser(function(user, done) {
		  done(null, user);
		});

		passport.deserializeUser(function(obj, done) {
		  done(null, obj);
		});

		passport.use(new GoogleStrategy({
		        returnURL: config.server.baseurl + '/auth/google/return',
		        realm: config.server.baseurl
		    },
		    function(identifier, profile, done) {
		      
		        app.databases.users.findOne({_id: identifier}, function(err, doc) {
		            if (doc) {
		                profile.identifier = identifier;
		                profile.authType = "google";
		                return done(null, profile);
		            }
		            else {
		                return done(null, false, { message: "No user with identifier " + identifier + " found"});
		            }
		        });
		    }
		));		

		app.use(passport.initialize());
		app.use(passport.session());

		app.get('/auth/google', 
		  passport.authenticate('google', { failureRedirect: '/#/signin', failureFlash: true }),
		  function(req, res) {
		    res.redirect('/');
		  });

		app.get('/auth/google/return', 
		  passport.authenticate('google', { failureRedirect: '/#/', failureFlash: true }),
		  function(req, res) {
		    res.redirect('/');
		  });

		app.get('/logout', function(req, res){
		  req.logout();
		  res.redirect('/');
		});
	},
	ensureAuthenticated: function(req, res, next) {
	  if (req.isAuthenticated()) { 
	  	next();
	  }
	  else {
	  	res.status(401).send('Not authenticated');
	  }
	}
}
