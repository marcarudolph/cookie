var express = require('express'),
    config = require('../config/cookie-config.js'),
    mongo = require('./mongo'),
    flash = require('connect-flash'),
    ck = require('./ck'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    app = express();    


app.use(express.cookieParser());
app.use(express.session({ secret: config.session.secret }));
app.use(flash());
app.use(express.bodyParser());

function openDatabase(dbName, done) {
    mongo.createClient(config.databases[dbName], function(err, collection) {
        if (err) {
            console.error("Opening the " + dbName + " collection failed with error " + err);
            done(err);
            return;
        }
        app.databases = app.databases || {};
        app.databases[dbName] = collection;
        done(null, collection);
    });
}

openDatabase("recipes", function(){});
openDatabase("users", function(){});    
    
    
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


//Auth
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
        returnURL: config.server.baseurl + '/auth/google/return',
        realm: config.server.baseurl
    },
    function(identifier, profile, done) {
      
        app.databases.users.findOne({_id: identifier}, function(err, doc) {
            if (doc) {
                profile.identifier = identifier;
                profile.authType = "google";
                return done(null, profile);
            }
            else {
                return done(null, false, { message: "No user with identifier " + identifier + " found"});
            }
        });
    }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/#/signin', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/#/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



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

app.get('/api/fetchCK/:id', dontCache, function(req, resp) {
    
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

app.get('/api/recipes/', dontCache, function(req, resp) {
    
    app.databases.recipes.find(null, {title: true}).toArray(function(err, recipes) {
        if (!err) 
            resp.send(recipes);
        else
            resp.send(404);
    });    
});


app.get('/api/recipes/:id', dontCache, function(req, resp) {
    
    app.databases.recipes.findOne({_id: req.params.id}, function(err, doc) {
        if (doc)
            resp.send(doc);
        else
            resp.send(404);
    });
});

app.put('/api/recipes/:id', dontCache, function(req, resp) {
    
    var recipe = req.body;
    recipe["_id"] = req.params.id;
    
    app.databases.recipes.save(recipe, function(err) {
        if (!err)
            resp.send(recipe);
        else
            resp.send(409);
    });
    
});

function handleRenameRecipe(req, resp) {
    var renameData = req.body;
    
    app.databases.recipes.findOne({_id: renameData.oldId}, function(err, recipe) {
    
    if (recipe){
        recipe._id = getIdFromRecipeTitle(renameData.title);

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
    
    app.databases.recipes.insert(recipe, function(err){
        if(!err){
            resp.send({id: recipe._id});
        }
        else {
            resp.send(409);
        }
    });
    
}

app.post('/api/recipes/', dontCache, function(req, resp) {
    
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    