"use strict"
var dbCreds = process.env.ES_CREDS ? process.env.ES_CREDS + "@" : "",
    dbHost = process.env.ES_HOST || "es:9242",
    uploadTempPath = process.env.UPLOAD_TEMP_PATH || "/tmp",
    picturesPath = process.env.PICTURES_PATH || "./pics",
    connString = dbCreds + dbHost;


var config = {
    server: {
        port:   8088,
        ip: "0.0.0.0",
        baseurl: 'http://localhost:8088',
        uploadTempPath: uploadTempPath,
        cacheMaxAge: 1209600
    },
    database: { host: connString },
    indexes: {
        cookie: "cookie"
    },
    session: {
        secret: "hashmeifyoucan"
    },
    pictures: {
        directory: picturesPath
    },
    auth: {
        clientID: "629961806849-hm8g1af4pg4tp0kpcgaj2ghnliddpjep.apps.googleusercontent.com",
        clientSecret: "QBS7duL9UyBpk-P6LXSRR9Xq",
        realm: "cookie"
    }
};

module.exports = config;