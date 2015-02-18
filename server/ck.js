var https = require('https'),
    request = require("request"),
    Promise = require('es6-promise').Promise,
    config = require('../config/cookie-config.js'),
    imaging = require("./imaging.js"),
    recipeServices = require('./recipe-services.js'),
    shortid = require("shortid"),
    fs = require("fs"),
    atob = require('atob');

var ck = {

    getRecipe: function(id, next) {
        var host = atob('YXBpLmNoZWZrb2NoLmRl'),
            path = atob('L2FwaS8xLjIvYXBpLXJlY2lwZS5waHA/SUQ9') + id,
            agent = atob('TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyA2XzFfMyBsaWtlIE1hYyBPUyBYKSBBcHBsZVdlYktpdC81MzYuMjYgKEtIVE1MLCBsaWtlIEdlY2tvKSBNb2JpbGUvMTBCMzI5ICg1MDM2NTU1MzYp'),
            url = 'https://' + host + path;

        var options = { 
            hostname: host,
            path: path,
            method: 'GET',
            headers: { 
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': agent
            }
        };       
        
        https.get(options, function(res) {
            var json = '';
            res.on('data', function(chunk) {
                json += chunk;
            });
            res.on('end', function() {
                var recipe = JSON.parse(json);
                convertRecipe(url, recipe, next);
            });
        }).on('error', function(e) {
            next(null, e);
        });
    },
    getPics: getPics 

};

function convertRecipe(url, ckResult, next) {

    var ckr = ckResult.result[0];
    if (!ckr) {
        next("No ck recipe in ckResult");
        return;
    }
    //console.log(JSON.stringify(ckr));
    var recipe = {
        "origin": {
            "system": "ck",
            "id": ckr.rezept_id,
            "user_id": ckr.rezept_user_id,
            "user_name": ckr.rezept_user_name,
            "rating": {
                "average": ckr.rezept_votes.average,
                "votes": parseInt(ckr.rezept_votes.votes)
            },
            "frontend_url": ckr.rezept_frontend_url,
            "data_url": url
        },
        "title": ckr.rezept_name,
        "subtitle": ckr.rezept_name2,
        "date": ckr.rezept_datum,
        "skill_level": ckr.rezept_schwierigkeit,
        "rating": {
            "likes": 0
        },
        "instructions": splitInstructions(ckr.rezept_zubereitung),
        "servings": parseInt(ckr.rezept_portionen),
        "ingredients": ckr.rezept_zutaten.map(function(z) {
            return {
                "name": markdownifyHtml(z.name),
                "comment": markdownifyHtml(z.eigenschaft),
                "quantity": parseFloat(z.menge),
                "unit": z.einheit
            };
        }),
        "preparation_time": ckr.rezept_preparation_time,
        "cooking_time": ckr.rezept_cooking_time,
        "resting_time": ckr.rezept_resting_time,
        "nutrition": {
            "kcal": ckr.rezept_kcal
        },
        "tags": ckr.rezept_tags
    };
    
    if (ckr.rezept_bilder) {
        recipe.pictures = ckr.rezept_bilder.map(function(b) {
            var format = b["960x720"];//todo getBiggestPictureFormat(b);
            return {
                "file": format.file,
                "user_name": format.user_name
            };
        });
    } else {
        recipe.pictures = [];
    }

    next(null, recipe);
}

function getBiggestPictureFormat(formats) {
    //TODO: keine x und y Angabe mehr, sondern nur noch im Property-Name enthalten 
    var maxArea = 0,
        biggestFormat = {};
        
    for(var formatName in formats) {
        if (formats.hasOwnProperty(formatName)) {
            var format = formats[formatName],
                area = format.x * format.y;
            if (maxArea < area) {
                maxArea = area;
                biggestFormat = format;
            }
        }
    }
    
    return biggestFormat;
}

function splitInstructions(zubereitung) {
    var instructions = [];
    zubereitung.split('\r\n').map(function(z) {
        if (z !== '') instructions.push(markdownifyHtml(z));
    });
    return instructions;
}

function markdownifyHtml(html) {
    html = html.replace('<b>', '**').replace('</b>', '**');
    html = html.replace('<i>', ' _').replace('</i>', '_ ');
    
    return html;
}

function getPics(recipe) {
    return new Promise(function(resolve, reject) {
        if (!recipe.pictures || recipe.pictures.length === 0)
            return resolve();

        var nameMap = {};
        var baseHeaders = {
            "Accept-Encoding": "gzip, deflate, sdch",
            "Accept-Language": "de-DE,de;q=0.8,en;q=0.6",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.94 Safari/537.36"
        };

        function downloadPage(url) {
            return new Promise(function(resolve, reject) {
                var headers = JSON.parse(JSON.stringify(baseHeaders));
                headers.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8";

                request({
                        url: url,
                        headers: headers
                    },
                    function (error) {
                        if (error)
                            return reject(error);

                        return resolve();
                    }
                );
            });
        }

        function downloadPic(url, ref, targetPath, waitMs) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    var headers = JSON.parse(JSON.stringify(baseHeaders));
                    headers.Referer = ref;
                    headers.Accept = "image/webp,*/*;q=0.8";

                    request({
                            url: url,
                            headers: headers
                        },
                        function (error) {
                            if (error)
                                return reject(error);

                            return resolve();
                        }
                    ).pipe(fs.createWriteStream(targetPath));
                   
                }, waitMs || 0);
            });
        }

        function unlinkDownloadedPics() {
            for (var key in nameMap) {
                var file = nameMap[key];
                if (fs.existsSync(file))
                    fs.unlinkSync(file);            
            };
        }

        var prom = downloadPage(recipe.origin.frontend_url);
        var picturesToDownload = recipe.pictures.filter(function(pic) {            
            return pic.file && pic.file.indexOf("http") === 0;
        });
        picturesToDownload.forEach(function(pic) {
            prom = prom.then(function() {
                var url = pic.file,
                    hash = require('crypto').createHash('md5').update(url).digest('hex'),
                    targetPath = config.server.uploadTempPath + "/" + hash + ".jpg";
                nameMap[url] = targetPath;
                if (fs.existsSync(targetPath)) {
                    return new Promise(function(resolve, reject) { resolve() });
                }
                else {
                    return downloadPic(url, recipe.origin.frontend_url, targetPath, 3000);
                }
            });
        });

        prom
        .then(function() {
            var rawPictures = [],
                targetNameMap = {};
            for(var key in nameMap){
                var file = nameMap[key],
                    targetFileName = shortid.generate() + ".jpg";

                rawPictures.push({
                    localPath: {path: file}, 
                    targetFileName: targetFileName
                });
                targetNameMap[key] = targetFileName;
            }

            var pictureConvertPromises = rawPictures.map(imaging.generatePicAndThumb);
            Promise.all(pictureConvertPromises)
            .then(function() {
                unlinkDownloadedPics();
                recipeServices.getRecipe(recipe._id)
                .then(function(recipe) {
                    recipe.pictures = recipe.pictures || [];
                    recipe.pictures.forEach(function(pic) {
                        if (targetNameMap[pic.file])
                            pic.file = targetNameMap[pic.file];
                    });

                    recipeServices.upsertRecipe(recipe)
                    .then(resolve)
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);            
        })
        .catch(function(err) {
            try {
                unlinkDownloadedPics();
            }
            catch(uerr) {
                console.log("unlinkDownloadedPics fail: " + uerr.stack);
            }
            reject(err);
        });            

    });
}

module.exports = ck;