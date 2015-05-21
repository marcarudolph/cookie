var jwt = require('jsonwebtoken');

function UnauthorizedError (code, error) {
  Error.call(this, error.message);
  this.name = "UnauthorizedError";
  this.message = error.message;
  this.code = code;
  this.status = 401;
  this.inner = error;
}

UnauthorizedError.prototype = Object.create(Error.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;


module.exports = function(options) {
  if (!options || !options.secret) throw new Error('secret should be set');

  return function(req, res, next) {
    var token;
    
    if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
	for (var ctrlReqs = req.headers['access-control-request-headers'].split(','),i=0;
	     i < ctrlReqs.length; i++) {
	    if (ctrlReqs[i].indexOf('authorization') != -1) 
		return next();
	}
    }
    
    if (typeof options.skip !== 'undefined') {
      if (options.skip.indexOf(req.url) > -1) {
        return next();
      }
    } 
    
    var authorization;
    if (req.headers && req.headers.authorization) {
      authorization = req.headers.authorization
    }
    else if (req.cookies && req.cookies.Authorization) {
      authorization = req.cookies.Authorization;
    }
    else {
      return next(new UnauthorizedError('credentials_required', { message: 'Neither Authorization header nor cookie was found' }));
    }

    var parts = authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0]
        , credentials = parts[1];
        
      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
    }
     

    jwt.verify(token, options.secret, options, function(err, decoded) {
      if (err) return next(new UnauthorizedError('invalid_token', err));

      req.user = decoded;
      next();
    });
  };
};
