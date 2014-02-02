
var config = {
    server: {
        port:   1506,
        ip: "0.0.0.0",
        baseurl: 'http://localhost:1506' 
    },
    databases: {
        recipes: { host: "127.0.0.1", port: 27017, db: "mgmt", collectionName: "recipes"},
        users: { host: "127.0.0.1", port: 27017, db: "mgmt", collectionName: "users"}
    },
    session: {
        secret: "hashmeifyoucan"
    }
};

module.exports = config;