
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

        recipeServices.handleNewRecipe = function(req, resp) {
            var recipe = req.body;

            recipeServices.mergeUserChangeableProperties(recipe, function(err, prepared) {
                if (!err) {
                    recipeServices.insertRecipe(prepared, function(err, insertedRecipe){
                        if (!err) {
                            resp.send({id: insertedRecipe._id});
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

        recipeServices.insertRecipe = function(recipe, done)
        {
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

