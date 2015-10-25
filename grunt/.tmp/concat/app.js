'use strict';

var app = angular.module('cookie', ['angularFileUpload', 'ngRoute', 'tagedit']);

app.config(['$httpProvider', function($httpProvider) {

    $httpProvider.interceptors.push(['$q', 'Page',
        function($q, Page) {
            return {
                'responseError': function(err) {
                    if (err.status === 401) {
                        Page.authenticateUser();
                    }
                    return $q.reject(err);
                }
            };
        }
    ]);


}]);




var module = angular.module('tagedit', []);
module.directive('tagedit',['$http',function($http){
    return {
        restrict:'AE',
        scope:{
            selectedTags:'=model',
            placeholder:'=placeholder',
            getSuggestions: '=suggestions'
        },
        templateUrl:'/partials/tagedit-template.html',
        link:function(scope,elem,attrs){

            scope.suggestions=[];

            //scope.selectedTags=[];

            scope.selectedIndex=-1;

            scope.removeTag=function(index){
                scope.selectedTags.splice(index,1);
            }

            scope.search=function(){
            	if (scope.searchText !== "") {            		
	            	scope.getSuggestions(scope.searchText)
	            	.then(function(data){
	                    if(data.indexOf(scope.searchText)===-1){
	                        data.unshift(scope.searchText);
	                    }
	                    scope.suggestions=data;
	                    scope.selectedIndex=0;
	                });
	            }
	            else {
	            	scope.suggestions = [];
	            }
            }

            scope.addToSelectedTags=function(index){
            	scope.selectedTags = scope.selectedTags || [];
                if(scope.selectedTags.indexOf(scope.suggestions[index])===-1){
                    scope.selectedTags.push(scope.suggestions[index]);
                    scope.searchText='';
                    scope.suggestions=[];
                }
            }

            scope.checkKeyDown=function(event){
                if(event.keyCode===40){
                    event.preventDefault();
                    if(scope.selectedIndex+1 !== scope.suggestions.length){
                        scope.selectedIndex++;
                    }
                }
                else if(event.keyCode===38){
                    event.preventDefault();
                    if(scope.selectedIndex-1 !== -1){
                        scope.selectedIndex--;
                    }
                }
                else if(event.keyCode===13){
                    scope.addToSelectedTags(scope.selectedIndex);
                }
                else if(event.keyCode===27){
                    scope.searchText='';
                    scope.suggestions = [];
                }
            }

            scope.$watch('selectedIndex',function(val){
                if(val!==-1) {
                    scope.searchText = scope.suggestions[scope.selectedIndex];
                }
            });
        }
    }
}]);
'use strict';

angular.module('cookie')
.factory('markdowner', markdowner)
.directive('markdown', markdownDirective);

function markdowner() {
    var service = {
        makeHtml: makeHtml
    };
    var renderer = new marked.Renderer();
    renderer.paragraph = function paragraphWithoutPTag(text) { 
        return text;
    }

    var markedOptions = {
        gfm: true,
        sanitize: true,
        breaks: true,
        renderer: renderer  
    };


    function makeHtml(md) {
        return marked(md, markedOptions);
    }

    return service; 
}

markdownDirective.$inject = ['markdowner'];
function markdownDirective(markdowner) {
    return {
        link: function (scope, element, attrs) {
            var markdown = scope[attrs.markdown];
            function updateContent() {
                
                if (!markdown) {
                    element.html('');
                    return;
                }
                
                var htmlText = markdowner.makeHtml(markdown);                
                element.html(htmlText);            
            }

            scope.$watch(attrs.markdown, function(value) {
                markdown = value;
                updateContent();
            });
            
            updateContent();
        }
    };

}
'use strict';

angular.module('cookie')
    .controller('PageCtrl', PageCtrl)
    .factory('Page', Page);

function Page() {
    var title = '';
    var authUser = null;
    return {
        title: function() {
            return title;
        },
        setTitle: function(newTitle) {
            title = newTitle;
        },

        authUser: function() {
            return authUser;
        },
        setAuthUser: function(user) {
            authUser = user;
        },

        authenticateUser: function() {
            this.setAuthUser(null);
            window.localStorage.locationBeforeAuth = window.location.href;
            window.location.href = '/#/auth';
        },
        onUserAuthenticated: function(user) {
            this.setAuthUser(user);
            var locationBeforeAuth = window.localStorage.locationBeforeAuth;
            if (locationBeforeAuth) {
                window.localStorage.locationBeforeAuth = '';
                window.location.href = locationBeforeAuth;
            }
        } 
    };
};


PageCtrl.$inject = ['$scope', '$http', 'Page'];
function PageCtrl($scope, $http, Page) {
    $http.get('/api/init')
    .success(function (appData) {
        if (appData.errors && appData.errors.length > 0) {
            app.errors = appData.errors;
            window.location.href="/#/error";
        }
        else if (!appData.user) {
            window.location.href="/#/auth";
        }
        else {
            Page.onUserAuthenticated(appData.user);
        }
    })
    .error(function(data, status, headers, config) {
        if (status === 401) {
            window.location.href="/#/auth";        
        }
        else {
            window.location.href="/#/error";            
        }
    });
    
    
    $scope.Page = Page;
}

'use strict';

var savedQuery = "";




RecipesCtrl.$inject = ['$q', '$scope', '$http', '$sce', 'Page', 'markdowner'];
function RecipesCtrl($q, $scope, $http, $sce, Page, markdowner) {

    Page.setTitle('Deine Rezepte');

    $scope.recipes = [];
    $scope.query = savedQuery;
    
    $scope.fetcher = null;

    var isPagePending = false,
        pendingRequestAbort = null;

    $scope.$watch('query', function() {
        var query = savedQuery = $scope.query;

        _.each(pendingRequests, function(pr) {
            pr.abort.resolve();
            delete pendingRequests[pr.url];
        });

        $scope.fetcher = function(start, count) { return fetch(query, start, count); };
        //fetchRecipes(true);
    });

    $scope.getFromCK = function() {
        $http.get('/api/fetchCK/' + $scope.ckId)
        .success(function (newRecipe) {
            window.location.href = "/#/recipes/" + newRecipe._id;
        });
    };

    $scope.filterByTag = function(tag) {
        $scope.query = tag;
    }

    var pendingRequests = {};
    function fetch(query, start, count) {
        var url = '/api/recipes/?q=' + query + "&from=" + start + "&size=" + count;            

        if (pendingRequests[url]) {
           return pendingRequests[url].promise;
        }      

        var pendingRequest = {
            url: url,
            abort: $q.defer(),
            promise: null
        }

        pendingRequest.promise = $q(function(resolve, reject) {

            $http({
                method: "get",
                url: url,
                timeout: pendingRequest.abort.promise
            })
            .success(function (recipes) {
                isPagePending = false;
                delete pendingRequests[url];

                transformMarkdown(recipes);

                resolve(recipes);
            })
            .error(function(a, b, c) {
                reject(a);
            });        

        });

        pendingRequests[url] = pendingRequest;
        return pendingRequest.promise;

        function transformMarkdown(recipes) {
            _.each(recipes, function(recipe) {
                if (recipe.title) {
                    recipe.title = markdowner.makeHtml(recipe.title);                        
                }
                if (recipe.subtitle) {
                    recipe.subtitle = markdowner.makeHtml(recipe.subtitle);
                }
            });
                   
        }
    }
}

'use strict';


RecipeCtrl.$inject = ['$scope', '$routeParams', 'Page', '$upload', '$http', '$q'];
function RecipeCtrl($scope, $routeParams, Page, $upload, $http, $q) {

    var id = $routeParams.recipeId;
    $scope.recipe = {};

    $scope.ingredientValues = {};

    function createNewRecipe() {
        var recipe = {
            origin: {
                system: 'cookie'
            },
          rating: {
            likes: 0
          },
          instructions: [],
          servings: 2,
          ingredients: [],
          pictures: [],
          tags: []
        };

        $scope.recipe = recipe;
        $scope.original_title = null;
        $scope.beginEdit();
        
        Page.setTitle('Neues Rezept...');
    }

    function loadRecipe(id) {
        var url = './api/recipes/' + id;
        
        Page.setTitle('Lade Rezept...');
        
        $http.get(url)
        .success(function (recipe) {
            Page.setTitle(recipe.title);
                            
            $scope.recipe = recipe;

            $scope.displayCopy = JSON.parse(JSON.stringify(recipe));
            updateCalculatedProperties();
            $scope.original_title = recipe.title;
            $scope.edit = false;
        })
        .error(function() {
            Page.setTitle('Ooops...');
        });        
    }

    function updateCalculatedProperties() {
        $scope.displayCopy.ingredients.map(function (ing) {
            ing.done = false;
            ing.quantity_calc = ing.quantity;
            ing.padded_comment = ing.comment;

            var startsWithWhitespaceOrPunctuation = /^\W/;
            if (!startsWithWhitespaceOrPunctuation.test(ing.comment))
                ing.padded_comment = ' ' + ing.padded_comment;
        });
        $scope.recalculateServings();
    }

    function refreshDisplayCopy(){
        var backupServings = $scope.displayCopy.servings;
        $scope.displayCopy = JSON.parse(JSON.stringify($scope.recipe));
        $scope.displayCopy.servings = backupServings;
        $scope.displayCopy.ingredients.forEach(function(ing) {
            ing.done = false;
        });
        updateCalculatedProperties();
    }
    
    function insertNewElementOnLastElementTabKey(event, element, array, newHandler){
        if (event.which !== 9 ||
            event.altKey ||
            event.shiftKey ||
            event.ctrlKey)
            return;
        
        if (array.indexOf(element) === array.length - 1) {
            newHandler();
        }
    }


    $scope.addToShoppingList = function (ingredient) {
        console.log(ingredient.name);
    };

    $scope.addInstructionToRecipe = function (){
        $scope.recipe.instructions.push('');
    };
    
    $scope.deleteInstruction = function (instruction){
        var index = $scope.recipe.instructions.indexOf(instruction);
        if (index > -1) {
            $scope.recipe.instructions.splice(index, 1);
        }        
    };

    $scope.handleInstructionTabKey = function(event, element) {
        insertNewElementOnLastElementTabKey(event, element, $scope.recipe.instructions, $scope.addInstructionToRecipe);
    };

    $scope.addIngredientToRecipe = function (){
       $scope.recipe.ingredients.push(
            {
              'name': '',
              'comment': '',
              'quantity': 1,
              'unit': null,
            });
    };
    
    $scope.deleteIngredient = function (ingredient) {
        var index = $scope.recipe.ingredients.indexOf(ingredient);
        if (index > -1) {
            $scope.recipe.ingredients.splice(index, 1);
        }
    };

    $scope.handleIngredientTabKey = function(event, element) {
        insertNewElementOnLastElementTabKey(event, element, $scope.recipe.ingredients, $scope.addIngredientToRecipe);
    };
    
    $scope.addLikeToRecipe = function()
    {
         execLike('like');
    };

    $scope.removeLikeFromRecipe = function() {
        execLike('dislike');
    };

    function execLike(action) {
        $http.post('/api/recipes/' + $scope.recipe._id + '/likes', {'action': action })
        .success(function() {
            loadRecipe($scope.recipe._id);
        });        
    }

    $scope.$watch('displayCopy.servings', function (newValue) {
        if (!newValue || !$scope.displayCopy.servings)
            return;

        $scope.displayCopy.servings = newValue;
        $scope.recalculateServings();        
    });

    $scope.recalculateServings = function () {
        $scope.displayCopy.ingredients.map(function (ing) {
            ing.quantity_calc = Math.round(ing.quantity / $scope.recipe.servings * $scope.displayCopy.servings * 100) / 100;
        });
    };
    
    $scope.beginEdit = function () {
        $scope.recipeBackup = JSON.parse(JSON.stringify($scope.recipe));
        $scope.edit = true;
        $scope.tagFetcher = $scope.tagFetcher || $http.get('/api/tags');

        fetchIngredientValues('name');
        fetchIngredientValues('unit');
        fetchIngredientValues('comment');

    };
    
    $scope.cancelEdit = function () {
        $scope.recipe = $scope.recipeBackup;
        $scope.edit = false;    
    };
    
    $scope.saveRecipe = function () {
        if (!$scope.recipe._id) {
            $scope.saveNewRecipeToServer();
        }
        else if($scope.original_title !== $scope.recipe.title)
        {
            renameAndSaveRecipeToServer($scope.recipe);
        }
        else
        {
            saveRecipeToServer($scope.recipe);
        }
            
        $scope.edit = false;
    };
    
    $scope.saveNewRecipeToServer = function() {
        $http.post('/api/recipes/?action=new', $scope.recipe)
        .success(function(response) {
            window.location.href = '/#/recipes/' +  response._id;
        });      
    };

    $scope.tagFetcher = null;
    $scope.getTags = function(query) {
        query = query.toLowerCase();
        return $q(function(resolve, reject) {
            $scope.tagFetcher
            .success(function(tags) {
                var matchingTags = tags.filter(function(t) { 
                    return t.tag.toLowerCase().indexOf(query) === 0;}
                );
                var tagsForControl = matchingTags.map(function(t) {
                    var tag = t.tag;
                    return tag.charAt(0).toUpperCase() + tag.slice(1); 
                });
                return resolve(tagsForControl);
            })
            .catch(reject);
        });
    }  ;

    function fetchIngredientValues(field) {

        var plural = field + 's',
            uri = '/api/recipes/values/ingredients.' + field;

        if($scope.ingredientValues[plural]) {
            return;
        }

        $scope.ingredientValues[plural] = [];
        $http.get(uri)
        .success(function(values) {
            $scope.ingredientValues[plural] = values;
        });
    }
    
    function renameAndSaveRecipeToServer(recipe){
        $http.post('/api/recipes/?action=rename',
            {
                oldId: recipe._id, 
                title: recipe.title
            }
        )
        .success(function(response) {
            recipe._id = response._id; 
            saveRecipeToServer(recipe);
            window.location.href = '/#/recipes/' +  recipe._id;
        });
    }
    
    function saveRecipeToServer(recipe){
        $http.put('/api/recipes/' + recipe._id, recipe)
        .success(function() {
            refreshDisplayCopy();    
        });
    }  

    $scope.onFileSelect = function($files) {
        $scope.upload = $upload.upload({
            url: '/api/recipes/' + $scope.recipe._id + '/pictures/',
            method: 'POST',
            file: $files
        }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(updatedRecipe) {
            $scope.displayCopy.pictures = updatedRecipe.pictures;
        });
    };
    
    if (id !== '_new')
        loadRecipe(id);
    else
        createNewRecipe();
    
}
'use strict';


AuthCtrl.$inject = ['$scope', 'Page'];
function AuthCtrl($scope, Page) {    
    Page.setTitle('Sign in');
    
    var currentUser = Page.authUser();
    
    $scope.isSignedIn = (currentUser !== null);

    $scope.signOut = function() {        
        window.location.href='/logout';        
    };
}


'use strict';

ErrorCtrl.$inject = ['$scope', 'Page'];
function ErrorCtrl($scope, Page) {    
    Page.setTitle('Error');
    
    $scope.errors = app.errors;
    
}
'use strict';

angular.module('cookie')
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'partials/recipes.html',
        controller: RecipesCtrl
    }).
    when('/auth', {
        templateUrl: 'partials/auth.html',
        controller: AuthCtrl
    }).
    when('/error', {
        templateUrl: 'partials/error.html',
        controller: ErrorCtrl
    }).
    when('/recipes/:recipeId', {
        templateUrl: 'partials/recipe.html',
        controller: RecipeCtrl
    }).
    otherwise({
        redirectTo: '/'
    });
}]);
(function() {
    'use strict';


    angular.module('cookie')
        .directive('infiniteScroll', infiniteScroll);


    infiniteScroll.$inject = ['$parse'];
    function infiniteScroll($parse) {
        return {
            restrict: 'A',
            compile: function (element, attr, linker) { 
                return function($scope, $element, $attr) {
                    var templateHtml = $element[0].innerHTML;
                    $element[0].innerHTML = '';
                    
                    _.templateSettings = {
                      evaluate: /\[\[(.+?)\]\]/g,
                      interpolate: /\[\[:(.+?)\]\]/g
                    };
                    var compiled = _.template(templateHtml);
                    infiniteScroller($parse, $scope, $element, $attr, compiled);
                }
            }
        };
    }

    function infiniteScroller ($parse, $scope, $element, $attr, template) {
        var iScroll,
            sourceName,
            itemName;


        var expression = $attr.infiniteScroll;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*?$/);
        itemName = match[1];
        sourceName = match[2];

        setupScrollElements();
        setupHandlers();
        initScroller();

        $scope.$watch(sourceName, initScroller);

        function setupScrollElements() {

            $element[0].className += ' is-wrapper';

            var scroller = document.createElement('div');
            scroller.className = 'is-scroller';
            var list = document.createElement('ul');
            scroller.appendChild(list);
            var row = document.createElement('li')
            row.className = 'is-row';

            for (var i = 0; i < 50; i++) {
                list.appendChild(row.cloneNode());
            }
            $element[0].appendChild(scroller);
        }

        function setupHandlers() {
            $element[0].addEventListener('click', function(ev) {
                var actionAttr = ev.target.attributes['ng-click'];
                if (actionAttr) {
                    var exp = $parse(actionAttr.value);
                    $scope.$apply(function() {
                        exp($scope);                        
                    });
                }
            });

            $element[0].addEventListener('touchmove', function(ev) {
                ev.preventDefault();
            });

        }

        function initScroller () {
            if (iScroll) {
                iScroll.resetPosition();
                iScroll.destroy();
            }

            iScroll = new IScroll($element[0], {
                mouseWheel: true,
                infiniteElements: '.is-scroller .is-row',
                dataset: requestData,
                dataFiller: renderTemplate,
                preventDefault: false,
                cacheSize: 250
            });
        }

        function requestData (start, count) {
            var source = $scope[sourceName];
            if (!source) {
                return;
            }

            source(start, count)
            .then(function(data) {
                var length = data ? data.length : 0;
                if (length < count) {
                    iScroll.options.infiniteLimit = start + length;
                    iScroll.refresh();
                }
                iScroll.updateCache(start, data);       
            });
        }


        function renderTemplate (parent, data) {
            if (data) {
                var ctx = {};
                ctx[itemName] = data;
                var html = template(ctx);
                parent.innerHTML = html;        
            }
            else {
                parent.innerHTML = '';
            }            
        }

    }

})();


