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
                    id: id,
                    _source: ["*", "_id"]
                })
                .then(function(res) {
                    res._source._id = id;
                    resolve(res._source);
                })
                .catch(reject);
            });
        }

        recipeServices.mergeUserChangeableProperties = function(newRecipe) {
            return new Promise(function(resolve, reject) {
                recipeServices.getRecipe(newRecipe._id)
                .then(function(existingRecipe) {
                    var mergedRecipe = existingRecipe;
                    mergedRecipe.subtitle = newRecipe.subtitle;
                    mergedRecipe.instructions = newRecipe.instructions;
                    mergedRecipe.servings = newRecipe.servings;
                    mergedRecipe.ingredients = newRecipe.ingredients;

                    resolve(mergedRecipe);
                })
                .catch(function(err) {
                    if (err.status === 404) {
                        var newRecipe = JSON.parse(JSON.stringify(RECIPE_TEMPLATE));
                        newRecipe._id = recipe._id;
                        newRecipe.title = recipe.title;
                        newRecipe.subtitle = recipe.subtitle;
                        newRecipe.instructions = recipe.instructions;
                        newRecipe.servings = recipe.servings;
                        newRecipe.ingredients = recipe.ingredients;

                        resolve(newRecipe);
                    }
                    else {
                        reject(err);
                    }
                });
            });
        }

        recipeServices.handleRenameRecipe = function(req, resp) {
            var renameData = req.body;
            
            app.databases.recipes.findOne({_id: renameData.oldId}, function(err, recipe) {
            
            if (recipe){
                if(getIdFromRecipeTitle(renameData.title) !== getIdFromRecipeTitle(recipe.title)){

                    delete recipe._id;
                    recipe.title = renameData.title;

                    recipeServices.insertRecipe(recipe, function(err, insertedRecipe){
                        if(!err){
                            app.databases.recipes.remove({_id: renameData.oldId}, function(err){
                                if(!err){
                                    resp.send({id: insertedRecipe._id});
                                }
                                else {
                                    resp.send(410);
                                }
                            });
                        }
                        else {
                            resp.send(409);
                        }
                    });
                }
                else{
                   resp.send({id: recipe._id}); 
                }
            }
            else
                resp.send(404);
                
            });    
        }

        recipeServices.handleNewRecipe = function(recipe) {
            return new Promise(function(resolve, reject) {
                recipeServices.mergeUserChangeableProperties(recipe)
                .then(function(recipeToSave) {
                    recipeServices.insertRecipe(prepared, function(err, insertedRecipe) {
                        if (!err) {
                            resolve({id: insertedRecipe._id});
                        }
                        else {
                            reject(err);
                        }
                    });                
                })
                .catch(reject);
            });
        }

        recipeServices.upsertRecipe = function(recipe) {
            var id = recipe._id,
                body = JSON.parse(JSON.stringify(recipe));

            body._id = undefined;

            return app.database.index({
                index: config.indexes.cookie,
                type: "recipe",
                id: id,
                body: body
            });
        }


        recipeServices.insertRecipe = function(recipe, done) {
            if(!recipe._id){
                recipe._id = getIdFromRecipeTitle(recipe.title);
            }

            app.databases.recipes.insert(recipe, function(err) {
                if (!err) {
                    done(null, recipe);
                }
                else{
                    if(err.code == 11000){
                        if(! /-\d+$/.test(recipe._id)){
                          recipe._id = recipe._id + "-0";  
                        }
                        
                        recipe._id = recipe._id.replace(/\d+$/, function(n){ return ++n; });
                        recipeServices.insertRecipe(recipe, done);
                    }
                    else{
                        done(err, null);
                    }
                }
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

