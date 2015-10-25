
'use strict';
global.config = require('config.js');

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    elasticsearch = require('elasticsearch'),
    cacheControl = require('./utils/cache-control.js'),
    security = require('./utils/security.js'),
    recipeServices = require('./utils/recipe-services.js');

var app = express();

console.log(JSON.stringify(global.config, null, ' '));

app.use(cookieParser());
app.use(bodyParser.json());



app.database = new elasticsearch.Client(global.config.database);

security.init(app);
recipeServices.init(app);

app.use(cacheControl.dontCache);
app.use(security.ensureAuthenticated);

require('./request-handlers/init.js').init(app);
require('./request-handlers/recipes.js').init(app);
require('./request-handlers/ck.js').init(app);
require('./request-handlers/tags.js').init(app);


app.use(express.static(__dirname + '/../ui/'));
app.use('/pics', function(req, resp, next) {
    cacheControl.doCache(req, resp, function() {
        express.static(global.config.pictures.directory)(req, resp, next);
    });
});

app.listen(global.config.server.port, global.config.server.ip);
console.log('Listening on port ' + global.config.server.port);




    


    
    
    
    
    
    
    
    
    
    
    
    
    
    