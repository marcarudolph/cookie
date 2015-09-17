'use strict';

var recipeServices = require('../utils/recipe-services.js');
var respond = require('../utils/respond.js');


exports.init = init;

function init(app) {
    app.get('/api/tags', function(req, resp) {
        recipeServices.getTags()
        .then(respond.withData)
        .catch(respond.withError(resp));            
    });
}