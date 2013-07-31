var mongodb = require('mongodb'),
    async = require('async'),
    Db = mongodb.Db,
    Server = mongodb.Server;

exports.Db = Db,
exports.Server = Server,

exports.createClient = function(config, next) {

    var server = new Server(config.host, config.port, {auto_reconnect: true, socketOptions: {keepAlive:1}}),
        db = new Db(config.db, server, { w: 1 });
    
     db.open(function(err, conn) {
        if (err) {
            console.error("mongo-db - Error while opening db '" + config.host + ":" + config.port + "': " + err);
            next(err);
        }
        else {
            db.collection(config.collectionName, function(err, collection) {
                if (err) {
                    console.error("mongo-db - Error while opening collection '" + config.collectionName + "': " + err);
                    next(err);
                }
                else {
                    console.log("mongo-db - connected to collection '" + config.collectionName + "'");
                    next(null, collection);
                }
            });                
        }
    });
};

exports.ensureIndexes = function(collection, indexes, next) {
    async.each(indexes, 
        function(index, cont) {
            var indexOptions = {unique:index.unique, background:true, dropDups:false, w:1};
                
            if (index.expireAfterSeconds)
                indexOptions.expireAfterSeconds = index.expireAfterSeconds;
                        
            collection.ensureIndex( index.fields, indexOptions, function(err, indexName) {
                if (err) {
                    console.error("mongo-db - Error while creating index '" + indexName + "': " + err);
                    cont(err);
                }
                else {                    
                    cont();
                }
                
            } );    
        },
        next
    );
};