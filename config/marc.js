
var config = {
    server: {
        port:   1507
        ip: "0.0.0.0",
        baseurl: 'http://maiden.eztwo.com:1507' 
    },
    databases: {
        recipes: { host: "127.0.0.1", port: 27017, db: "mgmt", collectionName: "recipes"}
    }
};

module.exports = config;