global.config = require('../config/cookie-config.js');

var elasticsearch = require("elasticsearch"),
	Promise = require('es6-promise').Promise,
	request = require('request'),
	ck = require("../server/ck.js"),
	recipeServices = require("../server/recipe-services.js");


var dbCreds = process.env.ES_CREDS ? process.env.ES_CREDS + "@" : "",
	dbHost = process.env.ES_HOST || "es:9242"
	connString = dbCreds + dbHost;

console.log("connecting to elastic search db " + connString);

var db = new elasticsearch.Client({
  host: connString,
  log: 'info'
});
app = {};
app.database = db;

console.log(JSON.stringify(global.config, null, ' '));

var headers = { 'Cookie': 'session=uGTIcpT0grb2SA1fgJgdtQ.5kZnAPEIWtPhw2X8WTheicUoh97exGUOFl6RzOxGeWhI_M17eZ7kOqGgovvIlxprHXSPiXH_gMfDg04_Bu9VzDH1rwo-KJtlg5c8bGSDwG0.1424097185871.1209600000.MH8nHiLlN0qHG-Pfq2bX7aHmR05SEjENH0VbxhhlsGk'};

//bulkTransformRecipes()

var skipPics = {
"Risotto-alla-milanese": true,
"Clints-Chili-con-Carne": true,
"Rosa-gebratene-Entenbrust-in-Rotweinjus": true,
"Kraeuterbutter": true,
"Kaesekuchen-aus-Bayern": true,
"Rotwein-Rouladen": true,
"All-American-Burger": true,
"Zitroneneistee": true,
"Wedges": true,
"Fuer-echte-Kerle-Das-perfekte-Rumpsteak-saignant-englisch-mit-Sauce-B-arnaise-und-Pommes": true,
"Roestzwiebeln": true,
"Hausgemachte-Spaetzle": true,
"True,ber-Apfelsaft": true,
"Pommes-frites-mit-Mayonnaise": true,
"pizza": true,
"Cheesy-Schoko-Muffins": true,
"Apfel-Lauch-Salat": true,
"Himbeermuffins-mit-saurer-Sahne": true,
"zuericher-geschnetzeltes": true,
"Pastitsio": true,
"G-teaux-au-chocolat-et-aux-bananes": true,
"Apfeltraum": true,
"Apfeltraum-Torte": true,
"Quesadillas": true,
"Hirschgulasch-in-Madeirasauce-und-Weintrauben": true,
"Cannelloni-mit-Gemuesesauce": true,
"Ruehrkuchen-mit-Sekt": true,
"Schokoladenkuchen-suesse-Suende-mal-ganz-zart": true,
"Eierlikoerkuchen": true,
"Curry-Haehnchen-mit-Reis": true,
"Gefuellte-Paprika-nach-Uroma-Susanne": true,
"Zwetschgenknoedel": true,
"Apfel-Ruehrkuchen": true,
"Apfel-Eierlikoer-Kuchen": true,
"Ruehrkuchen-mit-Schokoraspel": true,
"Herzhaft-gefuellter-Hokkaido-Kuerbis": true,
"Waldviertler-Knoedel": true,
"Fraenkischer-Schweinebraten-mit-dunkler-Brotsosse": true,
"Hias-Obaboarischa-Obatzda": true,
"Elsaesser-Flammkuchen": true,
"Spaghetti-mit-Artischocken-und-Schafskaese": true,
"Schoko-Nuss-Kuchen": true,
"Schnelle-Calzone": true,
"Scharfes-indisches-Schweinecurry": true,
"Zwiebelsalat-suess-sauer": true,
"spinat-lachs-roulade": true,
"focaccia": true,
"Kaiserschmarrn-Tiroler-Landgasthofrezept": true,
"new-yorker kaesekuchen": true,
"Schinkennudeln-la-Luna": true,
"Cupcake": true,
"Gebratener-Reis-mit-marinierten-Prawns": true,
"Schneewittchen-Kuchen": true,
"Schokoladensirup": true,
"ricotta-spinat-tortelloni": true,
"tomatensuppe": true,
"baggers": true,
"zitronenkuchen": true,
"schneller-nusskuchen": true,
"sandkuchen": true,
"mandarinen-muffins": true,
"Einfache-Bouillonkartoffeln-mit-Frischkaese": true,
"Die-beste-Okroschka-nach-Mamas-Rezept": true,
"Tarte-au-Chocolat": true,
"Original-italienische-Bruschetta": true,
"Heisser-Apfelsaft": true,
"dill-senf-sauce": true,
"kuerbis-kokos-konfituere": true,
"Kirschkuchen-mit-Mandel-Biskuit": true,
"Gebratener-dann-geschmorter-Lauch": true,
"Kaese-Streusel-Torte-mit-Apfel": true,
"lebkuchen-brownie-sterne": true,
"butterplaetzchen": true,
"Rinderkraftbruehe-mit-Gemuese": true,
"Ultimativer-Bienenstich": true,
"French-Toast": true,
"Mandarinen-Quark-Schnitten": true,
"huehnersuppe": true,
"Ratatouille-la-Remy": true,
"Roastbeef-bei-80-Grad": true,
"fondue-dips": true,
"rhabarberkuchen-mit-mandeln": true,
"bunter-hackfleisch---gemuese---eintopf": true,
"schoko-jumbo-muffins": true,
"hackfleisch---pfanne": true,
"hirschgulasch-mit-pfifferlingen": true,
"hirschgulasch-mit-frischen-pfifferlingen": true,
"heidelbeer-kaese-tarte": true,
"cocktailsosse": true,
"sahneheringe": true,
"spargelcremesuppe": true,
"rinderschmorbraten": true,
"zucchini---salsa": true,
"oktopus-auf-galicische-art": true,
"ofenkartoffeln-mit-sour-cream-und-lachs": true,
"chop---suey": true,
"panna-cotta-mit-orangenlikoer-himbeer-gelee": true,
"hohenloher-eierplotz": true,
"tamagoyaki,-japanisches-omelett": true,
"vanillesosse": true,
"saure-zipfel-(fraenkische-bratwuerste)": true,
"entenbrust-rosa": true,
"kokos-makronen": true,
"albondigas-in-tomatensauce": true,
"quarkauflauf-luftig-und-locker": true,
"jaegersosse": true,
"quark---krapfen": true,
"himbeer---schachbrett---torte": true,
"marc.a.rudolph@gmail.com": true,
"Halloween-Schoko-Muffins": true,
"wildlachs": true,
"avocado-limetten-dip": true,
"Bifteki": true,
"Ameisenkuchen-vom-Blech": true,
"Pfirsich-Joghurt-Kaesekuchen": true,
"Mandelplaetzchen-mit-Cranberries": true,
"Butterhoernchen-Lebkuchen": true,
"Italienische-Lasagne": true,
"Adschika": true,
"Schinkennudeln-nach-Art-meiner-Mama": true,
"Gebackene-Dorade-mit-scharfen-Ofenkartoffeln": true,
"asiatische-maispute": true,
"italienischer-salat-mit-rucola-und-parmesan": true,
"kartoffelbrot-vom-blech": true,
"reisauflauf": true,
"pulled-pork,-zarter-schweinebraten-aus-dem-ofen---fast-original,-nur-ohne-grill": true,
"zwiebelkuchen": true,
"leberknoedelsuppe-hausgemacht": true,
"trollcreme": true,
"schwarzwaelder-kirschtorte---super-easy": true,
"bbq-finishing-glaze-1": true,
"ciabatta": true,
"reis-mit-bohnensosse": true,
"nusskuchen": true,
"zucchini-chutney": true,
"falsche-gurken": true,
"zucchini-mit-hackfleisch---reis---fuellung": true,
"der-perfekte-milchreis---grundrezept": true,
"sushi---reis": true,
"birnenrahmstreusel": true,
"urmelis-haehnchenbrust-in-zucchini---curry---sahne---sauce": true,
"ofenkartoffeln-mit-sour-cream-und-lachs-1": true,
"pflaumen-crumble": true,
"eisbein-mit-sauerkraut-und-meerrettich-pueree": true,
"indisches-chicken-korma": true,
"tuerkisches-hackrezept": true,
"koefte": true,
"rhabarber-muffins": true,
"Bratapfelkuchen-mit-ganzen-Aepfeln": true,
"Grundrezept-Muffins": true,
"Russischer-Hackfleischtopf": true,
"norwegische-lachsroulade": true,
"Mauselochkuchen": true,
"Rhabarber-Baiser-Kuchen": true,
"Schoko-Nuss-Cupcakes-mit-Kirsch-Meringue-Buttercreme": true,
"Brezentaler-nach-Herta": true,
"kartoffeln-in-der-salzkruste": true,
"Faule-Weiber-Kuchen": true,
"Schneefloeckchen": true,
"Espresso-Schokoblueten": true,
"chicken-xacuti": true,
"Jerchen-s-Rosmarinkartoffeln": true,
"Lasagne-al-forno": true,
"Echte-Manti": true,
"frozen-strawberry margarita": true,
"Clints-Linseneintopf-mit-Wiener-Wuerstchen": true,
"Spare-Ribs-zum-Grillen-oder-fuer-den-Backofen": true,
"Lemon-Fresh": true,
"nudelsalat": true,
"fetacreme": true,
"griechischer-tomatenreis": true,
"cupcake": true,
"karottensuppe": true,
"blumenkohlsuppe": true,
"mac-and-cheese": true,
"indisches-haehnchen-mit-kartoffeln": true,
"Spezial-Spare-Ribs": true,
"albertos-glasiertes-schweinefilet": true,
"ente-a-la-fraeulein-jensen": true,
"omas-gulasch": true,
"pfannkuchenrolle-vom-blech": true,
"hackbraten-supersaftig": true,
"kartoffel---spinat---curry": true,
"gyrosauflauf-mit-metaxasauce": true,
"kassler": true,
"rotbarschfilet-im-zucchinimantel": true,
"quiche-lorraine": true,
"fraenkischer-spargelsalat": true,
"rahmschwammerl": true,
"zucchini---lasagne": true,
"wuerzessig-fuer-sushi": true,
"gargouillau": true,
"rigatoni-al-forno": true,
"nevs-brauhausgulasch": true,
"kuerbis---lasagne": true,
"suesssauer-eingelegte-pfefferoni-oder-peperoni": true,
"gebackene-quitten-mit-schlagsahne": true,
"burgis-sachertorte---eine-wienerische-variante": true,
"omas-beste-frikadellen-(fleischkuechle)": true,
"christstollen----ultimativ--": true,
"kartoffelgratin": true,
"pesto": true,
"brombeerlikoer-gekocht-1": true,
"saure-zipfel-2": true,
"chinesisch-suess---sauer": true,
"tuerkischer-weisskrautauflauf": true,
"Donauwelle-super-easy": true,
"marmorkuchen": true,
"Italienische-Sommertarte": true,
"Paella": true,
"Bechamel": true,
"Halloween-Kuerbiskuchen": true,
"Portwein-Sauce": true,
"russische-zupftorte": true,
"Baileys-Gugelhupf": true,
"Mohn-Eierschecke": true,
"Macarons-la-framboise": true,
"Bienemayas-Karottengemuese": true,
"kartoffelcreme": true,
"bruschetta-italiana": true,
"Rehmedaillons-auf-Rahmsteinpilzen": true,
"sauerkraut": true,
"ricotta-bananennocken": true,
"rucolasalat-mit-gebratenen-feigen-und-peccorino": true,
"Tabouleh-suess-scharf": true,
"lauch-nudeln": true,
"kaesekuchen-mit-obst": true,
"brombeerlikoer-gekocht": true,
"erdbeer---biskuit---rolle": true,
"croutons": true,
"zucchiniaufstrich": true,
"joghurtcreme-mit-erdbeeren": true,
"rolfs-gulasch": true,
"gemuesebruehpulver---wie-ich-es-mache": true,
"ingwerpaste": true,
"ofenkartoffeln-mit-chili-con-carne": true,
"risotto-alla-milanese": true,
"huehnerragout": true,
"chrissis-puten---gyros": true,
"fischsuppe": true,
"bohnensalat": true,
"russischer-hackfleischtopf": true,
"kirsch---schmand---kuchen": true,
"rindfleisch-mit-meerrettichsosse": true,
"nudelauflauf": true,
"sagenhafte-brownies-mit-zucchini": true,
"mediterrane-zucchini---pfanne": true,
"tomaten---tarte-mit-ziegenkaese": true,
"bestes-woken": true,
"fraenkisches-schaeufele": true,
"thailaendisches-garnelencurry": true,
"bauerntopf": true,
"gaensebrust": true,
"ueberbackene-lachs---tagliatelle": true,
"laugenstangen": true,
"indisches-naan-brot": true,
"kaffeelikoer": true,
"hackbaellchen-in-fruchtig---scharfer-tomatensauce-mit-koriander": true,
"kartoffelsuppe": true,
"schokostreusel---kaesekuchen": true,
"boerek-mit-hackfleisch": true,
"rote-linsensuppe": true,
"tuerkischer-joghurtkuchen": true,
"iskender-auflauf-mit-schafskaesesauce": true,
"moehrenmuffins": true,
"Bohneneintopf-la-Mike": true,
"Schweinefilet-mit-Pfifferlingen-oder-Champignons": true,
"Cr-me-Catalane": true,
"Annelies-Kirsch-Schmandkuchen": true,
"Schneller-Obstkuchen-vom-Blech": true,
"Uromas-Vanillekipferl": true,
"Cupcakes": true,
"griessnockerl---suppe": true,
"Schneller-Zitronenkuchen-auf-dem-Blech": true,
"Nussrolle": true,
"khare-masale ka murg": true,
"Rosmarinkartoffeln-die-besten": true,
"grillhaehnchen": true,
"Spanische-Aioli": true,
"chili-mango-dip": true,
"apfelkruemelkuchen": true,
"Tiramisu": true,
"Pizza-Frutti-Di-Mare": true,
"Rotes-Pesto": true,
"muerbeteig-fuer-kuchen-aus-der-springform": true,
"hollerbluetensirup-joghurt-mousse": true,
"lasagne": true,
"rinderbraten-mit-balsamico-rotweinsauce": true,
"gefuellte-paprika": true,
"feurige-gemueselasagne": true,
"gebackene-dorade-mit-scharfen-ofenkartoffeln": true,
"kraeuterbutter": true,
"fischpfanne-griechische-art": true,
"semmelknoedel": true,
"spaghettini-aglio,-olio-e-peperoncino": true,
"italienischer-brotsalat": true,
"tomaten-tarte": true,
"apfelkuechle": true,
"khare-masale-ka-murg": true,
"granatsplitter-mit-weisser-fuellung": true,
"erdbeer---mascarponecreme": true,
"blumenkohlsuppe-mit-parmesan": true,
"scones": true,
"tomatenbasis": true,
"zucchini-gefuellt-(mit-hack+kaese)": true,
"djuvec---paprikareis": true,
"haehnchen-suess-sauer": true,
"rosenkohl-curry": true,
"erdbeer-joghurt-muffins": true,
"zucchini---puffer-mit-kaese": true,
"studenten---arrabiata": true,
"alkoholfreier-winterpunsch": true,
"saure-zipfel-(nuernberger-bratwuerste)": true,
"brataepfel": true,
"kartoffel---lachs---gratin-mit-pfifferlingen": true,
"gefuellte-champignons": true,
"kaesespaetzle": true,
"omas-quark-apfel-streusel-torte": true,
"mercimek-koefte": true,
"Trueber-Apfelsaft": true,
"https://www.google.com/accounts/o8/id?id=AItOawnPKhOP-sZ5sAraq-NpSJAD-LnKyXpbfBs": true
}


bulkTransformRecipes()
// .then(function(recipes) {
// 	return new Promise(function(resolve, reject) {
// 		var filtered = recipes.filter(function(recipe) {
// 			return !skipPics[recipe._id];
// 		});
// 		resolve(filtered);
// 	});	
// })
// .then(getPics)
.catch(function(err) {
	console.log(err.stack);
});
recipeServices.init(app);

function bulkTransformRecipes() {
	return new Promise(function(resolve, reject) {
		getAllRecipes()
		.then(function(recipeInfos) {
			var recipePromises = recipeInfos.map(getRecipe);
			Promise.all(recipePromises)
			.then(function(recipes) {
				var bulk = [];
				recipes.forEach(function(recipe) {
					console.log(recipe._id);
					// if (recipe.pictures) {
					// 	recipe.pictures = recipe.pictures.sort(function(a, b) {
					// 		if (!a.file || !b.file)
					// 			return 0;
					// 		if (a.file.indexOf("http") !== 0 && b.file.indexOf("http") === 0)
					// 			return -1;
					// 		if (a.file.indexOf("http") === 0 && b.file.indexOf("http") !== 0)
					// 			return 1;
					// 		return 0;
					// 	});
					// }

					bulk.push({index: {_index: "cookie", _type: "recipe", _id: recipe._id }});
					var clonedRecipe = JSON.parse(JSON.stringify(recipe));
					clonedRecipe._id = undefined;
					bulk.push(clonedRecipe);
				});
				console.log("Bulking " + recipes.length)
				db.bulk({body: bulk}, function(err, resp) {
					if (err)
						return reject(err);
					return resolve(recipes);
				});
			})
			.catch(reject);
		});
	});
}

function getAllEsRecipes() {
	return new Promise(function(resolve, reject) {
		db.search(
			{_index: "cookie", _type: "recipe", size: 999999}
		)
		.then(function(dbResult) {
			var hits = dbResult.hits.hits,
				recipes = hits.map(function(hit) {
					hit._source._id = hit._id;
					return hit._source;
				});
			resolve(recipes);
		})
		.catch(reject);
	});
}

function getPics(recipes) {
	var getPicsPromise = null;
	recipes.forEach(function(recipe) {
		if (getPicsPromise) {
			getPicsPromise = getPicsPromise.then(function() {
				console.log("Getting pics for " + recipe._id);
				return ck.getPics(recipe);
			});
		}
		else {
			console.log("Getting pics for " + recipe._id);
			getPicsPromise = ck.getPics(recipe);
		}
	});
	return getPicsPromise;	
}

function getRecipe(recipeInfo) {
	return new Promise(function(resolve, reject) {
		request(
			{
				url: 'http://localhost:8088/api/recipes/' + recipeInfo._id,
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
				url: 'http://localhost:8088/api/recipes/',
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


