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

var headers = { 'Cookie': 'session=wsQI5FdB4w6OtRGOnQxJ7g.QwaNtVhrDuQ8hXpbcv9sVSmWKhLR68UPlGnLEztQgm4Hs6t0JpH20xCNk9jidQNnpHhl5ep4qs9GNKyi43kOcun9npHeO9dTnuL7-Y_Cri3PbTu5oCN5vrQoOvuWXtsfD_g6oHeZicxdOjgfmbdL-lLK40ucNz0Ai43-LrYPoxw.1422812437790.1209600000.M2-idwinta4G-bGJRkMRYfYHb9-c7Z6Yk9VG1w-Fev8'};

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


