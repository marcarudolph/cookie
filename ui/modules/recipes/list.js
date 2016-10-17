'use strict';

var savedQuery = "";


RecipeListCtrl.$inject = ['$q', '$scope', '$http', '$sce', 'Page', 'markdowner'];
function RecipeListCtrl($q, $scope, $http, $sce, Page, markdowner) {

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
      var ckId = extractId($scope.ckId);
      if(!ckId){
        alert("insert valid id or url");
        return;
      }
      
      $http.get('/api/fetchCK/' + ckId)
      .success(function (newRecipe) {
          window.location.href = "/#/recipes/" + newRecipe._id;
      });
    };
    
    function extractId(input){
      var urlIdRegEx = /^http.*?\/?m?([0-9]+)\/?/g;
      var idOnlyRegEx = /^m?([0-9]+)$/g;
      
      var matches = urlIdRegEx.exec(input.trim(' '));
      
      if(!matches || !matches[1]) {
        matches = idOnlyRegEx.exec(input.trim(' '));
      }
      
      if(!matches || !matches[1]){
        return undefined;
      }
      
      return matches[1];
    }

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

                transformHighlights(recipes);

                resolve(recipes);
            })
            .error(function(a, b, c) {
                reject(a);
            });

        });

        pendingRequests[url] = pendingRequest;
        return pendingRequest.promise;

        function transformHighlights(recipes) {
            _.each(recipes, function(recipe) {
                recipe.title = recipe.title_highlight_html || recipe.title;
                recipe.subtitle = recipe.subtitle_highlight_html || recipe.subtitle;
            });
                   
        }
    }
}
