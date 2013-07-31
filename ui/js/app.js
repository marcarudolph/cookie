'use strict';

/* App Module */

angular.module('cookie', []).
  config(['$routeProvider', function ($routeProvider) {
      $routeProvider.
          when('/', { templateUrl: 'partials/recipes.html', controller: RecipesCtrl }).
          when('/recipes/:recipeId', { templateUrl: 'partials/recipe.html', controller: RecipeCtrl }).
          otherwise({ redirectTo: '/' });
  }]);