
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
        recipeServices.mergeUserChangeableProperties = function(recipe, done) {
            app.databases.recipes.findOne({_id: recipe._id}, function(err, loadedRecipe) {

                if (!err) {
                    if (loadedRecipe) {
                        //merge
                        loadedRecipe.subtitle = recipe.subtitle;
                        loadedRecipe.instructions = recipe.instructions;
                        loadedRecipe.servings = recipe.servings;
                        loadedRecipe.ingredients = recipe.ingredients;

                        done(null, loadedRecipe);
                    }
                    else {

                        var templateClone = JSON.parse(JSON.stringify(RECIPE_TEMPLATE));
                        //merge
                        templateClone._id = recipe._id;
                        templateClone.title = recipe.title;
                        templateClone.subtitle = recipe.subtitle;
                        templateClone.instructions = recipe.instructions;
                        templateClone.servings = recipe.servings;
                        templateClone.ingredients = recipe.ingredients;

                        done(null, templateClone);
                    }
                }
                else {
                    done(err);
                }
            });
        }

        recipeServices.handleRenameRecipe = function(req, resp) {
            var renameData = req.body;
            
            app.databases.recipes.findOne({_id: renameData.oldId}, function(err, recipe) {
            
            if (recipe){
                recipe._id = getIdFromRecipeTitle(renameData.title);
                recipe.title = renameData.title;

                if(renameData.oldId !== recipe._id){
                    app.databases.recipes.insert(recipe, function(err){
                        if(!err){
                            app.databases.recipes.remove({_id: renameData.oldId}, function(err){
                                if(!err){
                                    resp.send({id: recipe._id});
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
            }
            else
                resp.send(404);
                
            });    
        }

        recipeServices.handleNewRecipe = function(req, resp) {
            var recipe = req.body;
            recipe._id = getIdFromRecipeTitle(recipe.title);

            recipeServices.mergeUserChangeableProperties(recipe, function(err, prepared) {
                if (!err) {
                    app.databases.recipes.insert(prepared, function(err) {
                        if (!err) {
                            resp.send({id: prepared._id});
                        }
                        else {
                            resp.send(409);
                        }
                    });
                }
                else {
                    resp.send(409);
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

