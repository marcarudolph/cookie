var express = require('express'),
    config = require('../config/cookie-config.js'),
    mongo = require('./mongo'),
    flash = require('connect-flash'),
    ck = require('./ck'),
    db = require('./db'),
    security = require('./security'),
    app = express();


app.use(express.cookieParser());
app.use(express.session({ secret: config.session.secret }));
app.use(flash());
app.use(express.bodyParser());

db.init(app);
security.init(app);

    
    
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
    resp.setHeader('Cache-Control', 'public, max-age=120');
    next();
}    

var baseStatic = express.static(__dirname + '/../ui/');
function cachingStatic(req, resp, next) {
    doCache(req, resp, function() {
        baseStatic(req, resp, next);
    });
}



app.get('/api/init', dontCache, function(req, resp) {
    
    var appData = {
        errors: req.flash('error')
    };
    
    if (req.user) {
        appData.user = {
            name: req.user.displayName,
            id: req.user.emails[0],
            authType: req.user.authType
        };
    }
    
    resp.send(appData);
});

app.get('/api/upgradeAllRecipes', dontCache, function(req, resp) {
       app.databases.recipes.find().toArray(function(err, docs) {
            docs.map(function(recipe){
                var changed = false;
                
                //V0 -> V1
                if (recipe.ingedients) {
                    changed = true;
                    recipe.ingredients = recipe.ingedients;
                    delete recipe.ingedients;
                }                            
                
                if (changed) {
                   app.databases.recipes.save(recipe, function(err) {
                        if (err) {
                            console.error("error while saving upgraded recipe '" + recipe._id + "': " + err);
                            return;
                       }
                   });
                }
            });
       });
       
       resp.send("upgrade running");
});

app.get('/api/fetchCK/:id', dontCache, security.ensureAuthenticated, function(req, resp) {
    
    ck.getRecipe(req.params.id, function(err, recipe) {
        if (err) {
            resp.send(err);
            return;
        }
        
        app.databases.recipes.save(recipe, function(err) {
            if (!err)
                resp.send({_id: recipe._id});    
            else
                resp.send(409);
        });
        
    });
    
});

app.get('/api/recipes/', dontCache, security.ensureAuthenticated, function(req, resp) {
    
    app.databases.recipes.find(null, {title: true}).toArray(function(err, recipes) {
        if (!err) 
            resp.send(recipes);
        else
            resp.send(404);
    });    
});


app.get('/api/recipes/:id', dontCache, security.ensureAuthenticated, function(req, resp) {
    
    app.databases.recipes.findOne({_id: req.params.id}, function(err, doc) {
        if (doc)
            resp.send(doc);
        else
            resp.send(404);
    });
});

app.put('/api/recipes/:id', dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var recipe = req.body;
    recipe._id = req.params.id;
    
    getPreparedRecipe(recipe, function(err, prepared) {
        if(!err){
            app.databases.recipes.save(prepared, function(err) {
                if (!err){
                  resp.send(prepared);  
                } 
                else{ 
                    resp.send(409);
                }
            });
        }
        else{
            resp.send(409);
        }
    });
    
});

const RECIPE_TEMPLATE = {
        "_id": null,
        "origin": {
            "system": "cookie"
            //"user_id": "f232b6c9917b5c3a1c456061b84cf020", --> googleUserId
            //"user_name": "Pol-Pot", --> googleUserName
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

function getPreparedRecipe(recipe, done) {
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
            done("not found");
        }
    });
}

function handleRenameRecipe(req, resp) {
    var renameData = req.body;
    
    app.databases.recipes.findOne({_id: renameData.oldId}, function(err, recipe) {
    
    if (recipe){
        recipe._id = getIdFromRecipeTitle(renameData.title);
        recipe.title = renameData.title;

        if(renameData.oldId !== recipe._id){
            console.log(recipe);
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

function handleNewRecipe(req, resp) {
    var recipe = req.body;
    recipe._id = getIdFromRecipeTitle(recipe.title);

    getPreparedRecipe(recipe, function(err, prepared) {
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

app.post('/api/recipes/', dontCache, security.ensureAuthenticated, function(req, resp) {
    
    switch (req.query.action) {
        case "rename":
            handleRenameRecipe(req, resp);
            break;
        case "new":
            handleNewRecipe(req, resp);
            break;
    }
});

app.use(cachingStatic);


app.listen(config.server.port, config.server.ip);
console.log('Listening on port ' + config.server.port);

function getIdFromRecipeTitle(title){
    var tmp = title.toLowerCase();
    
    tmp = tmp.replace(" ","-");
    tmp = tmp.replace("/","-");
    tmp = tmp.replace("?","-");

    tmp = tmp.replace("ä","ae");
    tmp = tmp.replace("ö","oe");
    tmp = tmp.replace("ü","ue");
    tmp = tmp.replace("ß","ss");
    
    return tmp;
}

app.post('/api/recipes/:id/likes', dontCache, security.ensureAuthenticated, function(req, resp) {
    app.databases.recipes.findOne({_id:  req.params.id}, function(err, recipe) {
        if (recipe){
            var request = req.body;
            switch (request.action) {
                case "like":
                    recipe.rating.likes = recipe.rating.likes +1;
                break;
                case "dislike":
                    recipe.rating.likes = recipe.rating.likes -1;
                break;
            }
            
            app.databases.recipes.save(recipe, function(err){
                if(!err){
                   resp.send(JSON.stringify({}));
                }
                else {
                    resp.send(409);
                }
            });
        }
        else{
            resp.send(404);
        }
    });
});
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    