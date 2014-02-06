var config = require('../config/cookie-config.js'),
	passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy;


module.exports = {
    init: function(app) {
    	
		function findUserById(identifier, done) {
				      
		    app.databases.users.findOne({_id: identifier}, function(err, doc) {
		    	if (err) {
		    		return done(err, null);
		    	}
		        else if (doc) {
		            return done(null, doc);
		        }
		        else {
		            return done(null, false, { message: "No user with identifier " + identifier + " found"});
		        }
		    });

		}

		passport.serializeUser(function(user, done) {
			done(null, user._id);
		});

		passport.deserializeUser(function(id, done) {
    		findUserById(id, function(err, user, msg) {
    			if (err || msg) {
    				return done((err || msg), null);
    			}
    			else {
    				return done(null, user);
    			}
    		});
		});

		passport.use(new GoogleStrategy({
		        returnURL: config.server.baseurl + '/auth/google/return',
		        realm: config.server.baseurl
		    },
		    function (identifier, profile, done) {
		    	findUserById(identifier, done);
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
