"use strict";

var Promise = require('es6-promise').Promise,
	expressJwt = require('./express-jwt.js'),
    jwt = require('jsonwebtoken'),
    config = require('../../config/cookie-config.js');

var encryptKey = config.auth.tokenSecret,
	decryptKey = config.auth.tokenSecret,
	algorithm = "HS256";

module.exports = function(options) {
	var ejwt = expressJwt({ secret: decryptKey, algorithm: algorithm, skip: options.skipPathes});

	return {
		generateToken: generateToken,
		checkAndGetAuthTokenData: checkAndGetAuthTokenData
	}

	function generateToken(tokenData) {
		return jwt.sign(
			tokenData, 
			encryptKey, 
			{
				algorithm: algorithm, 
				expiresInMinutes: global.config.auth.tokenExpiresInMinutes
			}
		);
	}

	function checkAndGetAuthTokenData(req, res) {
		return new Promise(function(resolve, reject) {
			ejwt(req, res, function (err) {
				if (err)
					return reject(err);
				else
					return resolve();
			});
		});
	}
}

