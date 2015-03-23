'use strict';

var savedQuery = "";

function RecipesCtrl($scope, Page) {

    Page.setTitle('Deine Rezepte');


    $scope.recipes = [];
    $scope.query = savedQuery;
    $scope.itemsToShow = 0;
    $scope.shownRecipes = [];

    $scope.$watch('query', function() {
        savedQuery = $scope.query;
        fetchList($scope.query);        
    });

    $scope.$watch('[recipes,itemsToShow]', function() {
        $scope.shownRecipes = $scope.recipes.slice(0, $scope.itemsToShow);        
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
        $scope.itemsToShow += 10;
    }

    function fetchList(query) {
        var url = '/api/recipes/?q=' + query;
        $.getJSON(url).done(function (data) {
            $scope.$apply(function () {
                data.sort(compareTitle);
                $scope.recipes = data;
                $scope.itemsToShow = 50;
            });
        }).fail(function(a, b, c) {
            console.error(a);
        });

        function compareTitle(a, b) {
            var at = a.title.toLowerCase(),
                bt = b.title.toLowerCase();

            if (at < bt)  return -1;
            if (at === bt)  return 0;
            return 1;
        }
    }
}

//RecipesCtrl.$inject = ['$scope', Page];