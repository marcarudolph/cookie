var passport = require('passport'),
    tokenAuth = require('./token-auth.js')({skipPathes: ['/auth/google', '/auth/google/return']});
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


module.exports = {
    init: function(app) {
    	
        function findUserById(id, done) {
            app.database.get({
                index: global.config.indexes.cookie,
                type: 'user',
                id: id
            })
            .then(function(resp) {
            	var user = resp._source;
            	user._id = resp._id;
                return done(null, user);
            })
            .catch(function(err) {
            	console.log(err);
                if (err.status == 404)
                    return done(null, false, { message: 'No user with id  ' + id + ' found'});
                else
                    return done(err, null);
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

		var google = new GoogleStrategy({
			    clientID: global.config.auth.clientID,
			    clientSecret: global.config.auth.clientSecret,
		        callbackURL: global.config.server.baseurl + '/auth/google/return'
		    },
		    function (accessToken, refreshToken, profile, done) {
		    	var id = profile._json.email;
		    	findUserById(id, done);
		    }
		);

		passport.use(google);		

		app.use(passport.initialize());

		app.get('/auth/google', 
		  passport.authenticate('google', { failureRedirect: '/#/signin', failureFlash: false, scope: ['email'] }),
		  function(req, res) {
		    res.redirect('/');
		  });

		app.get('/auth/google/return', 
		  passport.authenticate('google', { failureRedirect: '/#/', failureFlash: false }),
		  function(req, res) {
		  	console.log('User:' + JSON.stringify(req.user));
		  	appendTokenToResponse(req, res);
		    res.redirect('/');
		  });

		app.get('/logout', function(req, res){
		  req.logout();
		  res.redirect('/');
		});
	},

	ensureAuthenticated: function(activePathRegEx) {
		return function(req, res, next) {
			
			if (!activePathRegEx.test(req.path)) {
				return next();
			}

			tokenAuth.checkAndGetAuthTokenData(req, res)	
			.then(function() {
				var isSkippedRoute = (!req.user);
				if (isSkippedRoute)
					return next();

				next();
			})
			.catch(function(err) {
				console.log('auth via token - checkAndGetAuthTokenData failed with error ' + err.stack);
				return res.sendStatus(401);
			});
		}
	}
}

function appendTokenToResponse(req, res) {

	var token = generateTokenFromUser(req.user),
		oneWeek = 7 * 24 * 60 * 60 * 1000;

	res.cookie(
		'Authorization',
		'Bearer ' + token,
		{
			maxAge: oneWeek
			//secure: true
		}
	);	
}

function generateTokenFromUser(user) {
	var tokenData = {tenant: user.tenant, _id: user._id};
	return tokenAuth.generateToken(tokenData);
}


