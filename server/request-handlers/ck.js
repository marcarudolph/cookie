'use strict';

var recipeServices = require('../utils/recipe-services.js');
var ck = require('../utils/ck.js');
var respond = require('../utils/respond.js');

exports.init = init;

function init(app) {
    app.get('/api/fetchCK/:id', function(req, resp) {
        
        ck.getRecipe(req.params.id, function(err, recipe) {
            if (err) {
                resp.send(err);
                return;
            }
            
            recipeServices.setUniqueId(recipe)
            .then(recipeServices.upsertRecipe)
            .then(function(insertedRecipe) {
                ck.getPics(insertedRecipe)
                return insertedRecipe;
            })
            .then(respond.withData)
            .catch(respond.withError(resp));            
        });
        
    });
}