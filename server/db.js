var config = require('../config/cookie-config.js'),
    mongo = require('./mongo');

function openDatabase(dbName, done) {
    mongo.createClient(config.databases[dbName], function(err, collection) {
        if (err) {
            console.error("Opening the " + dbName + " collection failed with error " + err);
            done(err);
            return;
        }
        done(null, dbName, collection);
    });
}

module.exports = {
    init: function(app) {
        function addDbToApp(err, dbName, db) {
            app.databases = app.databases || {};
            app.databases[dbName] = db;            
        }

        openDatabase("recipes", addDbToApp);
        openDatabase("users", addDbToApp);    
    }
}