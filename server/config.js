"use strict"
var dbCreds = process.env.ES_CREDS ? process.env.ES_CREDS + "@" : "",
    dbHost = process.env.ES_HOST || "vsdev02:9243",
    uploadTempPath = process.env.UPLOAD_TEMP_PATH || "/tmp",
    picturesPath = process.env.PICTURES_PATH || "./pics",
    baseurl = process.env.BASE_URL || "http://localhost:8088",
    connString = dbCreds + dbHost;


var config = {
    server: {
        port:   8088,
        ip: "0.0.0.0",
        baseurl: baseurl,
        uploadTempPath: uploadTempPath,
        cacheMaxAge: 1209600
    },
    database: { 
        host: connString ,
        //log: "trace"
    },
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
        realm: "cookie",

        tokenSecret: "Ein Cookie (englisch [ˈkʊki]; zu deutsch Keks oder Plätzchen; auch Magic Cookie, engl. für magisches Plätzchen) ist in seiner ursprünglichen Form eine Textdatei auf einem Computer. Sie enthält typischerweise Daten über besuchte Webseiten, die der Webbrowser beim Surfen im Internet speichert. Im für den Anwender besten Fall dient ein Cookie dazu, dass er sich beim wiederholten Besuch einer verschlüsselten Seite nicht erneut anmelden muss – das Cookie teilt dem besuchten Rechner mit, dass er schon einmal da war. Im für den Anwender schlechtesten Fall speichert das Cookie Informationen über komplexes privates Internetverhalten und übermittelt diese, ähnlich wie ein Trojanisches Pferd, ungefragt an einen Empfänger. Anders als das Trojanische Pferd ist ein Cookie jedoch nicht versteckt und vom Anwender einseh- und löschbar.",
        tokenExpiresInMinutes: 60*24*14    
    }
};

module.exports = config;