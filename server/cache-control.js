var express = require('express'),
    config = require('../config/cookie-config.js');

var cacheMaxAge = config.server.cacheMaxAge || 0;

function dontCache(req, resp, next) {
    resp.setHeader('Cache-Control', 'no-cache, no-store, max-age=0');
    next();
}

function dontCacheIfNoOtherPolicyPresent(req, resp, next) {
    if(!resp.getHeader('Cache-Control')) 
        resp.setHeader('Cache-Control', 'no-cache, no-store, max-age=0');
    next();
}

function doCache(req, resp, next) {
    resp.setHeader('Cache-Control', 'public, max-age=' + cacheMaxAge);
    next();
}    

var baseStatic = express.static(__dirname + '/../ui/');
function cachingStatic(req, resp, next) {
    doCache(req, resp, function() {
        baseStatic(req, resp, next);
    });
}

module.exports = {
    dontCache: dontCache,
    dontCacheIfNoOtherPolicyPresent: dontCacheIfNoOtherPolicyPresent,
    doCache: doCache,
    cachingStatic: cachingStatic
}