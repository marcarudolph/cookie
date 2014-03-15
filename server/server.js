var express = require('express'),
    sessions = require("client-sessions"),
    config = require('../config/cookie-config.js'),
    mongo = require('./mongo'),
    flash = require('connect-flash'),
    ck = require('./ck'),
    db = require('./db'),
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
app.use(express.bodyParser());

db.init(app);
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
    
    app.databases.recipes.find(null, {title: true}).toArray(function(err, recipes) {
        if (!err) 
            resp.send(recipes);
        else
            resp.send(404);
    });    
});


app.get('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    app.databases.recipes.findOne({_id: req.params.id}, function(err, doc) {
        if (doc)
            resp.send(doc);
        else
            resp.send(404);
    });
});

app.put('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var recipe = req.body;
    recipe._id = req.params.id;
    
    recipeServices.mergeUserChangeableProperties(recipe, function(err, prepared) {
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





    
    
    
    
    
    
    
    
    
    
    
    
    
    
    