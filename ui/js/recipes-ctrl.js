'use strict';

var savedQuery = "";

function RecipesCtrl($scope, Page) {

    Page.setTitle('Deine Rezepte');


    $scope.recipes = [];
    $scope.query = savedQuery;
    $scope.orderBy = 'title';

    $scope.$watch('query', function() {
        savedQuery = $scope.query;
        fetchList($scope.query);        
    });

    
    $scope.getFromCK = function() {
        $.getJSON('/api/fetchCK/' + $scope.ckId).done(function (newRecipe) {
            window.location.href = "/#/recipes/" + newRecipe._id;
        });
    };

    $scope.filterByTag = function(tag) {
        $scope.query = tag;
    }

    function fetchList(query) {
        var url = '/api/recipes/?q=' + query;
        $.getJSON(url).done(function (data) {
            $scope.$apply(function () {
                $scope.recipes = data;
            });
        }).fail(function(a, b, c) {
            console.error(a);
        });

    }
}

//RecipesCtrl.$inject = ['$scope', Page];