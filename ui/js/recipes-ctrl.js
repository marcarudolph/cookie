'use strict';

var savedQuery = "";

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);




function RecipesCtrl($q, $scope, $http, $sce, Page) {

    Page.setTitle('Deine Rezepte');

    $scope.recipes = [];
    $scope.query = savedQuery;
    $scope.itemsToShow = 0;
    $scope.hasMoreRecipes = true;
    
    $scope.fetcher = null;

    var isPagePending = false,
        pendingRequestAbort = null;

    $scope.$watch('query', function() {
        var query = savedQuery = $scope.query;

        $scope.itemsToShow = 50;
        $scope.hasMoreRecipes = true;

        if (pendingRequestAbort) {
            pendingRequestAbort.resolve();
            pendingRequestAbort = null;
        }

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

    $scope.addAPage = function() {
        if (isPagePending)
            return;

        $scope.itemsToShow += 50;
        fetchRecipes();
    }

    function fetch(query, start, count) {
        return $q(function(resolve, reject) {
            var url = '/api/recipes/?q=' + query + "&from=" + start + "&size=" + count;
            pendingRequestAbort = $q.defer();

            $http({
                method: "get",
                url: url,
                timeout: pendingRequestAbort.promise
            })
            .success(function (recipes) {
                isPagePending = false;
                pendingRequestAbort = null;

                transformMarkdown(recipes);

                resolve(recipes);
            })
            .error(function(a, b, c) {
                reject(a);
            });        

        });

        function transformMarkdown(recipes) {
            var showdown = new Showdown.converter();
            _.each(recipes, function(recipe) {
                if (recipe.title) {
                    recipe.title = stripWrappingPTag(showdown.makeHtml(recipe.title));                        
                }
                if (recipe.subtitle) {
                    recipe.subtitle = stripWrappingPTag(showdown.makeHtml(recipe.subtitle));
                }
            });

            function stripWrappingPTag(html) {
                if (html.indexOf('<p>') === 0)
                    html = html.substr(3);
                if (html.substr(html.length - 4) === "</p>")
                    html = html.substring(0, html.length - 4);
                    
                return html;
            }                      
        }
    }


    function fetchRecipes(reset) {

        isPagePending = true;        

        var currentLength = reset ? 0 : $scope.recipes.length,
            neededSize = $scope.itemsToShow - currentLength,
            url = '/api/recipes/?q=' + $scope.query + "&from=" + currentLength + "&size=" + neededSize;
        if (neededSize <= 0)
            return;

        pendingRequestAbort = $q.defer();

        $http({
            method: "get",
            url: url,
            timeout: pendingRequestAbort.promise
        })
        .success(function (data) {
            isPagePending = false;
            pendingRequestAbort = null;

            if (reset) {
                $scope.recipes = [];
            }

            $scope.recipes = $scope.recipes.concat(data);
            if (data.length < neededSize) {
                $scope.hasMoreRecipes = false;
            }
        })
        .error(function(a, b, c) {
            console.error(a);
        });        
    }
}
