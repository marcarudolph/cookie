global.config = require('../config/cookie-config.js');

var elasticsearch = require("elasticsearch"),
	Promise = require('es6-promise').Promise,
	request = require('request'),
	oldRecipes = require('../../../recipes.json'),
	missing = require('./missing.json');


var db = new elasticsearch.Client({
  host: 'marc:g1bsonSG@conti.eztwo.com:9243',
  log: 'info'
});


// db.search(
// 	{_index: "cookie", _type: "recipe", size: 999999}
// )
// .then(function(dbResult) {
// 	var currentRecipes = {};
// 	var hits = dbResult.hits.hits,
// 		recipes = hits.forEach(function(hit) {
// 			currentRecipes[hit._id] = hit._source;
// 		});

// 	oldRecipes.forEach(function(old) {
// 		var id = old._id;
// 		var lowerId = id.toLowerCase();
// 		if (!currentRecipes[id] && !currentRecipes[lowerId]) {
// 			console.log('Missing id "' + id + '"');
// 		}
// 	});
// })
// .catch(function(err) {
// 	console.log(err.stack);
// })

var mapped = {};
oldRecipes.forEach(function(old) {
	mapped[old._id] = old;
});

for (var id in missing) {
	var oldRecipe = mapped[id];
	console.log(JSON.stringify(oldRecipe, null, ''));
	db.index({
		index: 'cookie',
		type: 'recipe',
		id: id,
		body: oldRecipe
	})
	.then(function() { console.log("Done: " + id)})
	.catch(function(err) { console.log("ERROR: " + id + "    " + err)});

	//return;
}