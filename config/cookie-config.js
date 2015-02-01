var dbCreds = process.env.ES_CREDS ? process.env.ES_CREDS + "@" : "",
    dbHost = process.env.ES_HOST || "es:9242"
    connString = dbCreds + dbHost;


var config = {
    server: {
        port:   8080,
        ip: "0.0.0.0",
        baseurl: 'http://localhost:8080' 
    },
    database: { host: connString },
    indexes: {
        cookie: "cookie"
    },
    session: {
        secret: "hashmeifyoucan"
    },
    pictures: {
        directory: "/tmp/cookiepics"
    }
};

module.exports = config;