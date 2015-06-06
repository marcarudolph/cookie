
"use strict";
global.config = require('../config/cookie-config.js');

var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    multer = require('multer'),
    shortid = require("shortid"),
    Promise = require('es6-promise').Promise,
    elasticsearch = require("elasticsearch"),
    ck = require('./ck.js'),
    imaging = require("./imaging.js"),
    cacheControl = require('./cache-control'),
    recipeServices = require('./recipe-services'),
    security = require('./security'),
    app = express();


console.log(JSON.stringify(global.config, null, ' '));

app.use(cookieParser());
app.use(bodyParser.json());

app.use(multer({
  dest: global.config.server.uploadTempPath,
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  }
}));

app.database = new elasticsearch.Client(global.config.database);

security.init(app);
recipeServices.init(app);


app.get('/api/init', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var appData = {
//        errors: req.flash('error')
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

app.get('/api/fetchCK/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    ck.getRecipe(req.params.id, function(err, recipe) {
        if (err) {
            resp.send(err);
            return;
        }
        
        recipeServices.setUniqueId(recipe)
        .then(recipeServices.upsertRecipe)
        .then(function(insertedRecipe) {
            ck.getPics(insertedRecipe)
            .then(function() {
                console.log("getPics for recipe " + insertedRecipe._id + " done!");
            })
            .catch(function(err) {
                console.log("getPics for recipe " + insertedRecipe._id + " failed: " + err.stack);
            })

            return resp.send(insertedRecipe);
        })
        .catch(function(err) {
            sendError(resp, err);
        });            
    });
    
});

app.get('/api/recipes/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var query = undefined,
        from = parseInt(req.query.from) || 0,
        size = parseInt(req.query.size) || 50;

    if (req.query.q) {
        var queryText = req.query.q.toLowerCase(),
        query = {
            "query_string" : {
                "fields" : ["title^3", "subtitle^2", "tags"],
                "query" : queryText + "*",
                "use_dis_max" : true
            }
        };
    }


    app.database.search({
        index: global.config.indexes.cookie,
        type: "recipe",
        from: from,
        size: size,
        _source: ["title", "subtitle", "titlePicture", "tags"],
        body: {
            query: query,
            sort: [{"title.raw": "asc"}],
            highlight : {
                pre_tags: ["**"],
                post_tags: ["**"],
                fields : {
                    title : {"type" : "fvh"},
                    subtitle: {"type" : "fvh"}
                }
            }
        }
    })
    .then(function(results) {
        var recipes = results.hits.hits.map(function(hit) {
            hit._source._id = hit._id;

            if (hit.highlight) {
                if (hit.highlight.title)
                    hit._source.title = hit.highlight.title[0];

                if (hit.highlight.subtitle)
                    hit._source.subtitle = hit.highlight.subtitle[0];
            }

            return hit._source;
        });
        return resp.send(recipes);
    })
    .catch(function(err) {
        sendError(resp, err);
    });
});


app.get('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {    

    recipeServices.getRecipe(req.params.id)
    .then(function(recipe) {
        return resp.send(recipe);
    })
    .catch(function(err) {
        sendFourOhFourOrError(resp, err);
    });
});


app.put('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    
    var recipe = req.body;
    recipe._id = req.params.id;
    
    recipeServices.updateRecipe(recipe)
    .then(function(savedRecipe) {
        return resp.send(savedRecipe);  
    })
    .catch(function(err) {
        sendError(resp, err);
    });
});


app.delete('/api/recipes/:id', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    recipeServices.deleteRecipe(req.params.id)
    .then(function() {
        return resp.send({});  
    })
    .catch(function(err) {
        sendFourOhFourOrError(resp, err);
    });   
});


app.post('/api/recipes/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    var body = req.body;
    
    var promise;
    switch (req.query.action) {
        case "rename":
            promise = recipeServices.renameRecipe(body);
            break;
        case "new":
            promise = recipeServices.newRecipe(body);
            break;
    }

    promise
    .then(function(savedRecipe) {
        return resp.send(savedRecipe);  
    })
    .catch(function(err) {
        sendError(resp, err);
    });

});


app.post('/api/recipes/:id/likes', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    recipeServices.getRecipe(req.params.id)
    .then(function(recipe) {
        var request = req.body;
        switch (request.action) {
            case "like":
                recipe.rating.likes = recipe.rating.likes +1;
            break;
            case "dislike":
                recipe.rating.likes = recipe.rating.likes -1;
            break;
        }
        
        recipeServices.upsertRecipe(recipe)
        .then(function() {
            resp.send(recipe.rating);
        })
        .catch(function(err) {
            sendError(resp, err);
        });
    })
    .catch(function(err) {
        sendError(resp, err);
    });    
});


app.post('/api/recipes/:id/pictures/', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    var files = req.files;
    var picturesToInsert = [];
    var rawPictures = [];

    for(var key in files){
        var file = files[key],
            targetFileName = shortid.generate() + ".jpg";

        picturesToInsert.push({
            file: targetFileName,
            user_name: req.user.email,
        });                

        rawPictures.push({
            localPath: file, 
            targetFileName: targetFileName
        });
    }

    var promise = new Promise(function(resolve, reject) {
        var convertPromise = null;
        rawPictures.forEach(function(raw) {
            if (convertPromise)
                convertPromise = convertPromise.then(function () { return imaging.generatePicAndThumb(raw); });
            else
                convertPromise = imaging.generatePicAndThumb(raw);
        });

        if (!convertPromise)
            return resolve();

        convertPromise
        .then(function() {
            recipeServices.getRecipe(req.params.id)
            .then(function(recipe) {
                recipe.pictures = recipe.pictures || [];
                recipe.pictures = picturesToInsert.concat(recipe.pictures);

                recipeServices.upsertRecipe(recipe)
                .then(resolve)
                .catch(reject);
            })
            .catch(reject);
        })
        .catch(reject);
    });

    promise
    .then(function(recipe) {
        unlinkFiles(files);
        resp.send(recipe);
    })
    .catch(function(err) {
        unlinkFiles(files);
        sendFourOhFourOrError(resp, err);
    });  

    function unlinkFiles(files) {
        for (var key in files) {
            var file = files[key];
            if (fs.existsSync(file.path))
                fs.unlinkSync(file.path);            
        };
    }


});


app.get("/api/tags", cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    recipeServices.getTags()
    .then(function(tags) {
        resp.send(tags);
    })
    .catch(function(err) {
        sendError(resp, err);
    });  
});

app.get("/api/recipes/values/:fieldPath", cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    recipeServices.getFieldValues(req.params.fieldPath)
    .then(function(values) {
        resp.send(values);
    })
    .catch(function(err) {
        sendError(resp, err);
    });  
});

app.get('/api/admin/recipes/update', cacheControl.dontCache, security.ensureAuthenticated, function(req, resp) {
    

    app.database.search({
        index: global.config.indexes.cookie,
        type: "recipe",
        from: 0,
        size: 10000,
        _source: [],
        body: {}
        
    })
    .then(function(results) {
        var recipePromises = results.hits.hits.map(function(hit) {
            return recipeServices.getRecipe(hit._id);
        });
        Promise.all(recipePromises)
        .then(function(recipes) {
            var upsertPromises = recipes.map(function(recipe) {
                return recipeServices.upsertRecipe(recipe);
            });
            Promise.all(recipePromises)
            .then(function(recipes) {
                res.status(201).send();
            });
        });
    });
});

app.use(express.static(__dirname + '/../ui/'));
app.use("/pics", function(req, resp, next) {
    cacheControl.doCache(req, resp, function() {
        express.static(global.config.pictures.directory)(req, resp, next);
    })
});

app.listen(global.config.server.port, global.config.server.ip);
console.log('Listening on port ' + global.config.server.port);


function sendError(resp, err) {
    console.log(err.stack);
    return resp.status(500).send("");
}

function sendFourOhFourOrError(resp, err) {
    if (err.status === 404) {
        return resp.status(404).send("");
    }
    else {
        sendError(resp, err);
    }    
}


    


    
    
    
    
    
    
    
    
    
    
    
    
    
    