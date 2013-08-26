var express = require('express'),
    config = require('../config/cookie-config.js'),
    mongo = require('./mongo'),
    ck = require('./ck'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy,
    app = express();    


app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));


mongo.createClient(config.databases.recipes, function(err, recipesDb) {
    if (err) {
        console.error("Opening the recipes db failed with error " + err);
        return;
    }
    app.databases = {
        recipes: recipesDb
    };
});
    
    
    
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
    returnURL: 'http://maiden.eztwo.com:' + config.server.port + '/auth/google/return',
    realm: 'http://maiden.eztwo.com:'  + config.server.port
  },
  function(identifier, profile, done) {
      profile.identifier = identifier;
      profile.authType = "google";
      return done(null, profile);
  }
));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/#/signin' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/#/signin' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



app.get('/api/init', dontCache, function(req, resp) {
    
    var appData = {};
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
                resp.send(500);
        });
        
    });
    
});

app.get('/api/recipes/', dontCache, function(req, resp) {
    
    app.databases.recipes.find(null, {title: true}).toArray(function(err, recipes) {
        if (!err) 
            resp.send(recipes);
        else
            resp.send(500);
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

app.use(cachingStatic);


app.listen(config.server.port);
console.log('Listening on port ' + config.server.port);