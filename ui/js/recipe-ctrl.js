'use strict';

function RecipeCtrl($scope, $routeParams) {

    var url = './api/recipes/' + $routeParams.recipeId;
    $.getJSON(url).done(function (recipe) {
        $scope.$apply(function () {
            recipe.ingredients.map(function (ing) {
                ing.done = false;
                ing.quantity_calc = ing.quantity;
            });
            recipe.original_servings = recipe.servings;
            $scope.recipe = recipe;
        });
    }).fail(function(a, b, c) {
        console.error(a);
    });

    $scope.recipe = {};

    $scope.addToShoppingList = function (ingredient) {
        console.log(ingredient.name);
    };

    $scope.$watch('recipe.servings', function (newValue, oldValue) {
        if (!newValue || !$scope.recipe.servings)
            return;

        $scope.recipe.ingredients.map(function (ing) {
            ing.quantity_calc = Math.round(ing.quantity / $scope.recipe.original_servings * newValue * 100) / 100;
        });
    });
}

//RecipeCtrl.$inject = ['$scope', $routeParams];