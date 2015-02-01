var config = require('../config/cookie-config.js'),
    Promise = require('es6-promise').Promise;

const RECIPE_TEMPLATE = {
        "_id": null,
        "origin": {
            "system": "cookie"
        },
        "title": "Neues Rezept",
        "subtitle": null,
        "date": new Date(),
        "rating": {
            "likes": 0
        },
        "instructions": [],
        "servings": 1,
        "ingredients": []
    };

var recipeServices = {
    init: function(app) {
        recipeServices.getRecipe = function(id) {
            return new Promise(function(resolve, reject) {
                app.database.get({
                    index: config.indexes.cookie,
                    type: "recipe",
                    id: id
                })
                .then(function(res) {
                    res._source._id = id;
                    resolve(res._source);
                })
                .catch(reject);
            });
        }

        recipeServices.mergeUserChangeableProperties = function(recipe) {
            return new Promise(function(resolve, reject) {
                function createAndMergeNewRecipeFromTemplate() {
                    var newRecipe = JSON.parse(JSON.stringify(RECIPE_TEMPLATE));
                    newRecipe._id = recipe._id;
                    newRecipe.title = recipe.title;
                    newRecipe.subtitle = recipe.subtitle;
                    newRecipe.instructions = recipe.instructions;
                    newRecipe.servings = recipe.servings;
                    newRecipe.ingredients = recipe.ingredients;

                    return resolve(newRecipe);
                }

                if (!recipe._id)
                    return createAndMergeNewRecipeFromTemplate();

                recipeServices.getRecipe(recipe._id)
                .then(function(existingRecipe) {
                    var mergedRecipe = existingRecipe;
                    mergedRecipe.subtitle = recipe.subtitle;
                    mergedRecipe.instructions = recipe.instructions;
                    mergedRecipe.servings = recipe.servings;
                    mergedRecipe.ingredients = recipe.ingredients;

                    return resolve(mergedRecipe);
                })
                .catch(function(err) {
                    return reject(err);
                });
            });
        }

        recipeServices.renameRecipe = function(renameData) {
            return new Promise(function(resolve, reject) {
                recipeServices.getRecipe(renameData.oldId)
                .then(function(recipe) {
                    if (getIdFromRecipeTitle(renameData.title) === getIdFromRecipeTitle(recipe.title)) {
                        return resolve(recipe);
                    }
                    
                    delete recipe._id;
                    recipe.title = renameData.title;

                    recipeServices.setUniqueId(recipe)
                    .then(recipeServices.upsertRecipe)
                    .then(function() {
                        return recipeServices.deleteRecipe(renameData.oldId);
                    })
                    .then(function() {
                        return resolve(recipe);
                    })
                    .catch(reject);
                })
                .catch(reject);
            });
        }

        recipeServices.updateRecipe = function(recipe) {            
            return recipeServices.mergeUserChangeableProperties(recipe)
                    .then(recipeServices.upsertRecipe);   
        }        

        recipeServices.newRecipe = function(recipe) {
            return recipeServices.mergeUserChangeableProperties(recipe)
                    .then(recipeServices.setUniqueId)
                    .then(recipeServices.upsertRecipe);   
        }

        recipeServices.upsertRecipe = function(recipe) {
            return new Promise(function(resolve, reject) {
                var id = recipe._id,
                    body = JSON.parse(JSON.stringify(recipe));

                body._id = undefined;

                app.database.index({
                    index: config.indexes.cookie,
                    type: "recipe",
                    id: id,
                    body: body
                })
                .then(function() {
                    resolve(recipe);
                })
                .catch(reject);
            });
        }

        recipeServices.deleteRecipe = function(recipeId) {
            return app.database.delete({
                index: config.indexes.cookie,
                type: "recipe",
                id: recipeId
            });
        }

        recipeServices.setUniqueId = function(recipe) {
            if(!recipe._id){
                recipe._id = getIdFromRecipeTitle(recipe.title);
            }            
            return new Promise(function(resolve, reject) {
                app.database.exists({
                    index: config.indexes.cookie,
                    type: "recipe",
                    id: recipe._id
                })
                .then(function(exists) {
                    if (!exists) {
                        return resolve(recipe);
                    }
                    else {
                        if(! /-\d+$/.test(recipe._id)){
                          recipe._id = recipe._id + "-0";  
                        }
                        
                        recipe._id = recipe._id.replace(/\d+$/, function(n){ return ++n; });
                        recipeServices.setUniqueId(recipe)
                        .then(resolve)
                        .catch(reject);                        
                    }
                });
            });
        }

        function getIdFromRecipeTitle(title) {
            var tmp = title.toLowerCase();
            
            tmp = tmp.replace(/ /g,"-");
            tmp = tmp.replace(/\//g,"-");
            tmp = tmp.replace(/\?/g,"-");

            tmp = tmp.replace(/ä/g,"ae");
            tmp = tmp.replace(/ö/g,"oe");
            tmp = tmp.replace(/ü/g,"ue");
            tmp = tmp.replace(/ß/g,"ss");
            
            return tmp;
        } 

    }
};
module.exports = recipeServices;

