'use strict';

var savedQuery = "";

function RecipesCtrl($scope, $http, Page) {

    Page.setTitle('Deine Rezepte');


    $scope.recipes = [];
    $scope.query = savedQuery;
    $scope.itemsToShow = 0;
    $scope.hasMoreRecipes = true;
    
    var isPagePending = false;

    $scope.$watch('query', function() {
        savedQuery = $scope.query;
        $scope.itemsToShow = 50;
        $scope.hasMoreRecipes = true;
        $scope.recipes = [];
        fetchRecipes();
    });

    $scope.getFromCK = function() {
        $.getJSON('/api/fetchCK/' + $scope.ckId).done(function (newRecipe) {
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


    function fetchRecipes() {

        isPagePending = true;
        var neededSize = $scope.itemsToShow - $scope.recipes.length,
            url = '/api/recipes/?q=' + $scope.query + "&from=" + $scope.recipes.length + "&size=" + neededSize;
        if (neededSize <= 0)
            return;

        $.getJSON(url).done(function (data) {
            $scope.$apply(function () {
                isPagePending = false;
                $scope.recipes = $scope.recipes.concat(data);
                if (data.length < neededSize) {
                    $scope.hasMoreRecipes = false;
                }
            });
        }).fail(function(a, b, c) {
            console.error(a);
        });        
    }
}

//RecipesCtrl.$inject = ['$scope', Page];