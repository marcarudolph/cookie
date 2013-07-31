var express = require('express'),
    config = require('../config/cookie-config.js'),
    mongo = require('./mongo'),
    ck = require('./ck'),
    app = express();    

    mongo.createClient(config.databases.recipes, function (err, recipesDb) {         
        if (err) {
            console.error("Opening the recipes db failed with error " + err);
            return;
        }        
        app.databases = {recipes: recipesDb};
    });

app.get('/api/upgradeAllRecipes', function(req, resp) {
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

app.get('/api/fetchCK/:id', function(req, resp) {
    
    ck.getRecipe(req.params.id, function(err, recipe) {
        if (err) {
            resp.send(err);
            return;
        }
        
        app.databases.recipes.save(recipe, function(err) {
            if (!err)
                resp.send({_id: recipe._id});    
            else
                resp.send(500);
        });
        
    });
    
});

app.get('/api/recipes/', function(req, resp) {
    
    app.databases.recipes.find(null, {title: true}).toArray(function(err, recipes) {
        if (!err) 
            resp.send(recipes);
        else
            resp.send(500);
    });    
});


app.get('/api/recipes/:id', function(req, resp) {
    
    app.databases.recipes.findOne({_id: req.params.id}, function(err, doc) {
        if (doc)
            resp.send(doc);
        else
            resp.send(404);
    });
    
});

app.use(express.static(__dirname + '/../ui/'));

app.listen(config.server.port);
console.log('Listening on port ' + config.server.port);