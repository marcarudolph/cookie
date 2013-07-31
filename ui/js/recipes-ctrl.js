'use strict';

function RecipesCtrl($scope) {

    $.getJSON('/api/recipes/').done(function (data) {
        $scope.$apply(function () {
            $scope.recipes = data;
        });
    }).fail(function(a, b, c) {
        console.error(a);
    });

    $scope.recipes = [];
    $scope.query = '';
    $scope.orderBy = 'title';
    
    $scope.getFromCK = function() {
        $.getJSON('/api/fetchCK/' + $scope.ckId).done(function (newRecipe) {
            window.location.href = "/#/recipes/" + newRecipe._id;
        });
    };
}

//RecipesCtrl.$inject = ['$scope'];