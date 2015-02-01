
"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    sessions = require("client-sessions"),
    config = require('../config/cookie-config.js'),
    elasticsearch = require("elasticsearch"),
    flash = require('connect-flash'),
    ck = require('./ck'),
    cacheControl = require('./cache-control'),
    recipeServices = require('./recipe-services'),
    security = require('./security'),
    app = express(),
    fs = require('fs'),
    gm = require('gm');


app.use(sessions({
  cookieName: 'session',
  secret: config.session.secret,
  duration: 14 * 24 * 60 * 60 * 1000
}));    
app.use(flash());
app.use(bodyParser());

app.database = new elasticsearch.Client(config.database);

security.init(app);
recipeServices.init(app);

app.get('/api/init', cacheControl.dontCache, function(req, resp) {
    
    var appData = {
        errors: req.flash('error')
    };
    
    if (req.user) {
        appData.user = {
            name: req.user.email,
            id: req.user._id,
            authType: req.user.authType
        };
    }
    
    resp.send(appData);
});

/*
app.get('/api/upgradeAllRecipes', cacheControl.dontCache, function(req, resp) {
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
*/

app.get('/api/fetchCK/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    ck.getRecipe(req.params.id, function(err, recipe) {
        if (err) {
            resp.send(err);
            return;
        }
        
        recipeServices.insertRecipe(recipe, function(err, insertedRecipe) {
            if (!err)
                resp.send({_id: insertedRecipe._id});    
            else
                resp.send(409);
        });
        
    });
    
});

app.get('/api/recipes/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    app.database.search({
        index: config.indexes.cookie,
        type: "recipe",
        size: 1001,
        _source: ["title", "_id"]
    })
    .then(function(results) {
        var recipes = results.hits.hits.map(function(hit) { return hit._source; });
        return resp.send(recipes);
    })
    .catch(function(err) {
        console.log(err.stack);
        return resp.send(500);
    });
});


app.get('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {    

    recipeServices.getRecipe(req.params.id)
    .then(function(recipe) {
        return resp.send(recipe);
    })
    .catch(function(err) {
        if (err.status == 404) {
            return resp.send(404);
        }
        else {
            console.log(err.stack);
            return resp.send(500);
        }
    });
});

app.put('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var recipe = req.body;
    recipe._id = req.params.id;
    
    recipeServices.mergeUserChangeableProperties(recipe)
    .then(function(recipeToSave) {
        recipeServices.upsertRecipe(recipeToSave)
        .then(function() {
            return resp.send(recipeToSave);  
        })
        .catch(function(err) {
            console.log(err.stack);
            return resp.send(500);
        });
    })
    .catch(function(err) {
        console.log(err.stack);
        return resp.send(500);
    });
})

app.post('/api/recipes/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    switch (req.query.action) {
        case "rename":
            recipeServices.handleRenameRecipe(req, resp);
            break;
        case "new":
            recipeServices.handleNewRecipe(req, resp);
            break;
    }
});

app.post('/api/recipes/:id/likes', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
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


app.post('/api/recipes/:id/pictures/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    app.databases.recipes.findOne({_id:  req.params.id}, function(err, recipe) {
        if (recipe){
            var files = req.files;
            var picturesToInsert = [];
            var rawPictures = [];

            for(var key in files){
                var file = files[key]; 
                var newFileName = guid() + ".jpg";

                picturesToInsert.push({
                                        "file": newFileName,
                                        "user_name": req.user.email,
                                     });                

                rawPictures.push({
                                    "localPath": file, 
                                    "newFileName": newFileName
                                });
            }
                
            var convertedCount = 0;
            for (var index = 0; index < rawPictures.length; ++index) {
                (function(index){
                    var newFilePath = config.pictures.directory + "//" +  rawPictures[index].newFileName;
                    var newThumbnailPath = config.pictures.directory + "//thumbnails//" +  rawPictures[index].newFileName;

                    gm(rawPictures[index].localPath.path)
                        .resize(2048)
                        .quality(45)
                        .autoOrient()
                        .write(newFilePath, function (err) {
                            if (err){
                                console.error(err);
                                resp.send(500);
                            }
                            else {
                                fs.unlink(rawPictures[index].localPath.path);                                
                                gm(newFilePath)
                                    .resize(150)
                                    .write(newThumbnailPath, function (err) {
                                        if(!err){
                                            delete rawPictures[index].localPath;
                                            convertedCount++;
                                
                                            if(convertedCount === rawPictures.length) {
                                                recipe.pictures=recipe.pictures||[];
                                                recipe.pictures = recipe.pictures.concat(picturesToInsert);

                                                app.databases.recipes.save(recipe, function(err){
                                                    if(!err){
                                                        resp.send(picturesToInsert);
                                                    }
                                                    else{
                                                        resp.send(409);
                                                    }
                                                });
                                            }
                                        }
                                        else{
                                            console.error(err);
                                            resp.send(500);
                                        }
                                    });
                            }
                        });   
                })(index);
            }                                      
        }
        else{
            resp.send(404);
        }
    });
});

function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}    

app.use(cacheControl.cachingStatic);
app.use("/pics", express.static(config.pictures.directory));


app.listen(config.server.port, config.server.ip);
console.log('Listening on port ' + config.server.port);





    
    
    
    
    
    
    
    
    
    
    
    
    
    
    