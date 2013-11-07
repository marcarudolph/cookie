
var config = {
    server: {
        port:   process.env.PORT,
        ip: process.env.IP,
        baseurl: 'http://' + process.env.C9_PROJECT + '.' + process.env.C9_USER + '.c9.io' 
    },
    databases: {
        recipes: { host: process.env.IP, port: 27017, db: "mgmt", collectionName: "recipes"},
        users: { host: process.env.IP, port: 27017, db: "mgmt", collectionName: "users"}
    },
    session: {
        secret: "i'm just a dummy"
    }
};

module.exports = config;