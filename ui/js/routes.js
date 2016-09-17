'use strict';

angular.module('cookie')
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'partials/recipes.html',
        controller: RecipesCtrl
    }).
    when('/auth', {
        template: '',
        controller: AuthCtrl
    }).
    when('/error', {
        templateUrl: 'partials/error.html',
        controller: ErrorCtrl
    }).
    when('/recipes/:recipeId', {
        templateUrl: 'partials/recipe.html',
        controller: RecipeCtrl
    }).
    when('/shopping-cart', {
        templateUrl: 'partials/shopping-cart.html',
        controller: 'ShoppingCartCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });
}]);