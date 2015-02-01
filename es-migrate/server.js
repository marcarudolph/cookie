var elasticsearch = require("elasticsearch"),
	Promise = require('es6-promise').Promise,
	request = require('request');

var dbCreds = process.env.ES_CREDS ? process.env.ES_CREDS + "@" : "",
	dbHost = process.env.ES_HOST || "es:9242"
	connString = dbCreds + dbHost;

console.log("connecting to elastic search db " + connString);

var db = new elasticsearch.Client({
  host: connString,
//  log: 'trace'
});

var headers = { 'Cookie': 'session=KvpPvALajxwP0aTs4WUQTg.s5HXAjZDFzBw-YGFKYVi_Klc5l3Wtiq-jDSdnIcWpNCRC515g2IidAzCaPnPbU_0vTmE1KWXL7c2ASGtspo-Om8JOVFOm5VtRudTDTWAleyyMx3isdGnF2j9jBcGHF189rD-2KlMjXuZ7cwAWzG1TJxuyVmFloqkcNWUyrTtFj0.1422377428978.1209600000.uD43_hqvylcQVkendoDFe2vl0on7egEO-7AVj6eZimk'};

getAllRecipes()
.then(function(recipeInfos) {
	var recipePromises = recipeInfos.map(getRecipe);
	Promise.all(recipePromises)
	.then(function(recipes) {
		var bulk = [];
		recipes.forEach(function(recipe) {
			bulk.push({index: {_index: "cookie", _type: "recipe", _id: recipe._id }});
			
			recipe._id = undefined;
			bulk.push(recipe);
		});
		console.log("Bulking " + recipes.length)
		db.bulk({body: bulk}, function(err, resp) {
			console.log("err: " + err);
			console.log("resp: " + resp);
		})
	})
	.catch(function(err) {
		console.log(err.stack);
	});

})
.catch(function(err) {
	console.log(err.stack);
});


function getRecipe(recipeInfo) {
	return new Promise(function(resolve, reject) {
		request(
			{
				url: 'http://cookie.eztwo.com/api/recipes/' + recipeInfo._id,
				headers: headers,
				json: true
			},
			function (error, response, body) {
				if (error)
					return reject(error);

				return resolve(body);
			}
		);	
	});	
}

function getAllRecipes() {
	return new Promise(function(resolve, reject) {
		request(
			{
				url: 'http://cookie.eztwo.com/api/recipes/',
				headers: headers,
				json: true
			},
			function (error, response, body) {
				if (error)
					return reject(error);
				return resolve(body);
			}
		);	
	});
}


