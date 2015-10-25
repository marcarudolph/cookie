var express = require('express');

var cacheMaxAge = global.config.server.cacheMaxAge || 0;

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

module.exports = {
    dontCache: dontCache,
    dontCacheIfNoOtherPolicyPresent: dontCacheIfNoOtherPolicyPresent,
    doCache: doCache
}