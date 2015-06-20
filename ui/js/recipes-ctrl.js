'use strict';

var savedQuery = "";

function RecipesCtrl($q, $scope, $http, $sce, Page) {

    Page.setTitle('Deine Rezepte');


    $scope.recipes = [];
    $scope.query = savedQuery;
    $scope.itemsToShow = 0;
    $scope.hasMoreRecipes = true;
    
    var isPagePending = false,
        pendingRequestAbort = null;

    $scope.$watch('query', function() {
        savedQuery = $scope.query;
        $scope.itemsToShow = 50;
        $scope.hasMoreRecipes = true;

        if (pendingRequestAbort) {
            pendingRequestAbort.resolve();
            pendingRequestAbort = null;
        }

        fetchRecipes(true);
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
