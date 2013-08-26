
var config = {
    server: {
        port:   process.env.PORT,
        ip: process.env.IP,
        baseurl: 'http://cookie.marcarudolph.c9.io' 
    },
    databases: {
        recipes: { host: process.env.IP, port: 27017, db: "mgmt", collectionName: "recipes"}
    }
};

module.exports = config;