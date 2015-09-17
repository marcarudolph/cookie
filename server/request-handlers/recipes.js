'use strict';

var fs = require('fs');    
var multer = require('multer');
var shortid = require('shortid');
var respond = require('../utils/respond.js');
var recipeServices = require('../utils/recipe-services.js');
var imaging = require('../utils/imaging.js');


exports.init = init;

function init(app) {

    app.get('/api/recipes/', function(req, resp) {
        
        var query;
        var from = parseInt(req.query.from) || 0;
        var size = parseInt(req.query.size) || 50;

        if (req.query.q) {
            var queryText = req.query.q.toLowerCase();
            query = {
                query_string : {
                    fields : ['title^3', 'subtitle^2', 'tags'],
                    query : queryText + '*',
                    use_dis_max : true
                }
            };
        }


        app.database.search({
            index: global.config.indexes.cookie,
            type: 'recipe',
            from: from,
            size: size,
            _source: ['title', 'subtitle', 'titlePicture', 'tags'],
            body: {
                query: query,
                sort: [{'title.raw': 'asc'}],
                highlight : {
                    pre_tags: ['**'],
                    post_tags: ['**'],
                    fields : {
                        title : {'type' : 'fvh'},
                        subtitle: {'type' : 'fvh'}
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
            return recipes;
        })
        .then(respond.withData)
        .catch(respond.withError(resp));
    });


    app.get('/api/recipes/:id', function(req, resp) {    

        recipeServices.getRecipe(req.params.id)
        .then(respond.withData)
        .catch(respond.withError(resp));
    });


    app.put('/api/recipes/:id', function(req, resp) {
        
        var recipe = req.body;
        recipe._id = req.params.id;
        
        recipeServices.updateRecipe(recipe)
        .then(respond.withData)
        .catch(respond.withError(resp));

    });


    app.delete('/api/recipes/:id', function(req, resp) {
        recipeServices.deleteRecipe(req.params.id)
        .then(respond.withData)
        .catch(respond.withError(resp));
  
    });


    app.post('/api/recipes/', function(req, resp) {
        var body = req.body;
        
        var promise;
        switch (req.query.action) {
            case 'rename':
                promise = recipeServices.renameRecipe(body);
                break;
            case 'new':
                promise = recipeServices.newRecipe(body);
                break;
        }

        promise
        .then(respond.withData)
        .catch(respond.withError(resp));

    });


    app.post('/api/recipes/:id/likes', function(req, resp) {
        recipeServices.getRecipe(req.params.id)
        .then(function(recipe) {
            var request = req.body;
            switch (request.action) {
                case 'like':
                    recipe.rating.likes = recipe.rating.likes +1;
                break;
                case 'dislike':
                    recipe.rating.likes = recipe.rating.likes -1;
                break;
            }
            return recipe;
        })
        .then(function (recipe) {
            return recipeServices.upsertRecipe(recipe);
        })
        .then(respond.withData)
        .catch(respond.withError(resp));
   
    });


    var upload = multer({
        dest: global.config.server.uploadTempPath,
        rename: function (fieldname, filename) {
            return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
        }
    });

    app.post('/api/recipes/:id/pictures/', upload.array('file0', 32), function(req, resp) {
        var files = req.files;
        var picturesToInsert = [];
        var rawPictures = [];

        for(var key in files){
            var file = files[key],
                targetFileName = shortid.generate() + '.jpg';

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
            respond.withError(resp)(err);
        });  

        function unlinkFiles(files) {
            for (var key in files) {
                var file = files[key];
                if (fs.existsSync(file.path))
                    fs.unlinkSync(file.path);            
            }
        }

    });


    app.get('/api/recipes/values/:fieldPath', function(req, resp) {
        recipeServices.getFieldValues(req.params.fieldPath)
        .then(respond.withData)
        .catch(respond.withError(resp));
 
    });

    app.get('/api/admin/recipes/update', function(req, resp) {
        
        app.database.search({
            index: global.config.indexes.cookie,
            type: 'recipe',
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
                Promise.all(upsertPromises)
                .then(function() {
                    resp.status(201).send();
                });
            });
        });
    });
}