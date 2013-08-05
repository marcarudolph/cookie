'use strict';

function RecipeCtrl($scope, $routeParams, Page) {

    var url = './api/recipes/' + $routeParams.recipeId;
    
    Page.setTitle('Lade Rezept...');
    
    $.getJSON(url).done(function (recipe) {
        Page.setTitle(recipe.title);
        $scope.$apply(function () {
            recipe.ingredients.map(function (ing) {
                ing.done = false;
                ing.quantity_calc = ing.quantity;
            });
            recipe.original_servings = recipe.servings;
            $scope.recipe = recipe;
        });
    }).fail(function(a, b, c) {
        Page.setTitle('Ooops...');
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

//RecipeCtrl.$inject = ['$scope', $routeParams, Page];