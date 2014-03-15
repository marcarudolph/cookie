
var config = {
    server: {
        port:   1506,
        ip: "0.0.0.0",
        baseurl: 'http://192.168.0.236:1506' 
    },
    databases: {
        recipes: { host: "127.0.0.1", port: 27017, db: "mgmt", collectionName: "recipes"},
        users: { host: "127.0.0.1", port: 27017, db: "mgmt", collectionName: "users"}
    },
    session: {
        secret: "hashmeifyoucan"
    },
    pictures: {
        directory: "c:/temp/cookiepics"
    }
};

module.exports = config;