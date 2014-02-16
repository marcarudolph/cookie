var https = require('https'),
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
    }

};

function convertRecipe(url, ckResult, next) {

    var ckr = ckResult.result[0];
    if (!ckr) {
        next("No ck recipe in ckResult");
        return;
    }

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
            var format = getBiggestPictureFormat(b);
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

module.exports = ck;